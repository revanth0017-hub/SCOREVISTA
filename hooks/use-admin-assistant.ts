'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { api } from '@/lib/api';
import { safeActionError } from '@/lib/client-errors';
import {
  findMatchByTeamNames,
  findTeamByName,
  isAffirmative,
  isNegative,
  parseScore,
  parseVsInput,
  type MatchListItem,
  type TeamNameMatch,
} from '@/lib/admin-assistant-helpers';
import {
  buildScoreUpdatePayload,
  formatScorePreview,
  validateSportScoreDraft,
  type SportScoreDraft,
} from '@/lib/sport-scoring';
import { getFlowConfigBySport } from '@/lib/sport-assistant-config';

export type ChatRole = 'assistant' | 'user';
export interface ChatLine {
  id: string;
  role: ChatRole;
  content: string;
}

export type FlowAction = 'update_score' | 'create_match' | 'manage_teams' | 'add_highlights';

export interface FlowContext {
  action: FlowAction;
  step: number;
  data: Record<string, unknown>;
}

function id(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

async function fetchMatches(sportId: string): Promise<MatchListItem[]> {
  const res = await api.get<{ success: boolean; data: MatchListItem[] }>(
    `/api/matches?sportId=${encodeURIComponent(sportId)}`
  );
  return (res as { data?: MatchListItem[] }).data || [];
}

async function fetchTeams(sportId: string): Promise<TeamNameMatch[]> {
  const res = await api.get<{ success: boolean; data: TeamNameMatch[] }>(
    `/api/teams?sportId=${encodeURIComponent(sportId)}`
  );
  return (res as { data?: TeamNameMatch[] }).data || [];
}

export function useAdminAssistant(sportId: string | null, sportSlug: string) {
  const [messages, setMessages] = useState<ChatLine[]>([]);
  const [flow, setFlow] = useState<FlowContext | null>(null);
  const [busy, setBusy] = useState(false);
  const [greeted, setGreeted] = useState(false);
  /** Highlight flow: multipart video file held until final POST (not serializable in flow data). */
  const stagedHighlightVideoRef = useRef<File | null>(null);

  const pushAssistant = useCallback((content: string) => {
    setMessages((prev) => [...prev, { id: id(), role: 'assistant', content }]);
  }, []);

  const pushUser = useCallback((content: string) => {
    setMessages((prev) => [...prev, { id: id(), role: 'user', content }]);
  }, []);

  useEffect(() => {
    if (!sportId || greeted) return;
    setMessages([
      {
        id: id(),
        role: 'assistant',
        content: 'Hi Admin 👋\nWhat would you like to do?',
      },
    ]);
    setGreeted(true);
  }, [sportId, greeted]);

  const startFlow = useCallback(
    (action: FlowAction) => {
      stagedHighlightVideoRef.current = null;
      setFlow({ action, step: 1, data: {} });
      
      // Use sport-specific prompts
      const config = getFlowConfigBySport(sportSlug);
      
      const prompts: Record<FlowAction, string> = {
        update_score: config.updateScorePrompt,
        create_match: config.createMatchPrompt,
        manage_teams: config.manageTeamPrompt,
        add_highlights: config.addHighlightPrompt,
      };
      pushAssistant(prompts[action]);
    },
    [pushAssistant, sportSlug]
  );

  const cancelFlow = useCallback(() => {
    stagedHighlightVideoRef.current = null;
    setFlow(null);
    pushAssistant('Cancelled. Pick another action when ready.');
  }, [pushAssistant]);

  const submitSportScoreDraft = useCallback(
    (draft: SportScoreDraft) => {
      if (!sportId || !flow || flow.action !== 'update_score' || flow.step !== 2) {
        pushAssistant('Pick a match first, then fill the score form.');
        return;
      }
      const slug = (sportSlug || 'cricket').toLowerCase();
      const err = validateSportScoreDraft(slug, draft);
      if (err) {
        pushAssistant(err);
        return;
      }
      const teamA = String(flow.data.teamALabel || 'Team A');
      const teamB = String(flow.data.teamBLabel || 'Team B');
      const status = draft.status || 'live';
      const fullDraft = { ...draft, status };
      const payload = buildScoreUpdatePayload(slug, fullDraft);
      const preview = formatScorePreview(slug, teamA, teamB, fullDraft);
      pushUser('(Review — sport score form)');
      setFlow({
        action: 'update_score',
        step: 3,
        data: {
          ...flow.data,
          scorePayload: payload,
          scorePreviewText: preview,
        },
      });
      pushAssistant(['Step 3 — Preview', '', preview, '', 'Save this score? (yes / no)'].join('\n'));
    },
    [sportId, sportSlug, flow, pushAssistant, pushUser]
  );

  const submitUserText = useCallback(
    async (
      text: string,
      opts?: {
        videoFile?: File | null;
        videoUrlHint?: string;
        /** Pick match by Mongo id (update score step 1, highlight step 2). */
        selectedMatchId?: string | null;
        /** Highlight flow: skip linking to a match. */
        skipMatchLink?: boolean;
      }
    ) => {
      if (!sportId) {
        pushAssistant('Sport is still loading. Please wait a moment.');
        return;
      }

      const trimmed = text.trim();
      const videoUrlHint = opts?.videoUrlHint?.trim() || '';
      const videoFile = opts?.videoFile ?? null;

      if (!flow) {
        if (trimmed) pushUser(trimmed);
        pushAssistant('Choose an action below to begin.');
        return;
      }

      if (trimmed.toLowerCase() === 'cancel') {
        if (trimmed) pushUser(trimmed);
        setBusy(false);
        cancelFlow();
        return;
      }

      if (trimmed) pushUser(trimmed);
      else if (videoFile) pushUser(`[Uploaded file: ${videoFile.name}]`);
      else if (videoUrlHint) pushUser(videoUrlHint);
      else if (flow.action === 'manage_teams' && flow.step === 2) {
        pushUser('(default — 1 player)');
      } else if (flow.action === 'add_highlights' && flow.step === 2 && opts?.skipMatchLink) {
        pushUser('(Sport-wide — no match link)');
      } else if (flow.action === 'add_highlights' && flow.step === 4 && !trimmed) {
        pushUser('(no description)');
      }

      setBusy(true);
      try {
        const { action, step, data } = flow;

        if (action === 'update_score' && step === 2 && !trimmed) {
          pushAssistant('Use the score form below — choose status, then click **Review update**. Or type cancel.');
          return;
        }

        if (action === 'update_score') {
          if (step === 1) {
            const matches = await fetchMatches(sportId);
            let found: MatchListItem | undefined;
            if (opts?.selectedMatchId) {
              found = matches.find((m) => m._id === opts.selectedMatchId);
              if (!found) {
                pushAssistant('Match not found ❌ Pick again from the list or type Team A vs Team B.');
                return;
              }
            } else {
              const parsed = parseVsInput(trimmed);
              if (!parsed) {
                pushAssistant('Please use the format: Team A vs Team B (e.g. India vs Australia), or pick a match from the list.');
                return;
              }
              const [na, nb] = parsed;
              found = findMatchByTeamNames(matches, na, nb);
              if (!found) {
                pushAssistant('Match not found ❌\nTry again with names closer to the schedule, or create the match first.');
                return;
              }
            }
            const teamALabel = found.teamA?.name || 'Team A';
            const teamBLabel = found.teamB?.name || 'Team B';
            const slug = (sportSlug || 'cricket').toLowerCase();
            
            // For cricket: add total overs step
            if (slug === 'cricket') {
              setFlow({
                action,
                step: 2,
                data: {
                  ...data,
                  matchId: found._id,
                  teamALabel,
                  teamBLabel,
                  adminSportSlug: slug,
                  isCricket: true,
                },
              });
              pushAssistant(
                [
                  `Match: ${teamALabel} vs ${teamBLabel}`,
                  'Step 2 — Enter total overs for this match (e.g., 20 for T20, 50 for ODI)',
                  'Type the number or cancel.',
                ].join('\n')
              );
              return;
            }

            // For shuttle: add set selection step
            if (slug === 'shuttle') {
              setFlow({
                action,
                step: 2,
                data: {
                  ...data,
                  matchId: found._id,
                  teamALabel,
                  teamBLabel,
                  adminSportSlug: slug,
                  isShuttle: true,
                },
              });
              pushAssistant(
                [
                  `Match: ${teamALabel} vs ${teamBLabel}`,
                  'Step 2 — Select which set to score: [A] [B] [C]',
                  'Or type: Set A, Set B, Set C',
                ].join('\n')
              );
              return;
            }
            
            // For other sports: show regular form
            setFlow({
              action,
              step: 2,
              data: {
                ...data,
                matchId: found._id,
                teamALabel,
                teamBLabel,
                adminSportSlug: slug,
              },
            });
            pushAssistant(
              [
                `Match: ${teamALabel} vs ${teamBLabel}`,
                `Step 2 — Scoring for **${slug}** (your admin sport).`,
                'Use the sport-specific form below, set Live / Finished, then click **Update Score**.',
                '(Chat text is optional here — the form is required.)',
              ].join('\n')
            );
            return;
          }

          // Cricket totalOvers step
          if (step === 2 && (data.isCricket)) {
            if (!trimmed) {
              pushAssistant('Enter number of overs (e.g., 20, 50) or type cancel.');
              return;
            }
            const totalOvers = parseInt(trimmed);
            if (isNaN(totalOvers) || totalOvers <= 0) {
              pushAssistant('Enter a valid positive number of overs.');
              return;
            }
            setFlow({
              action,
              step: 3,
              data: {
                ...data,
                totalOvers,
              },
            });
            pushAssistant(
              [
                `✓ Match set up for ${totalOvers} overs`,
                'Step 3 — Real-time ball entry',
                'Use ball buttons in the form below. Each click updates instantly.',
                'Click "Undo Last Ball" if you make a mistake. When done, set status to Finished.',
                'Previous match data will load automatically.',
              ].join('\n')
            );
            return;
          }

          // Shuttle set selection step
          if (step === 2 && (data.isShuttle)) {
            if (!trimmed) {
              pushAssistant('Select a set: [A] [B] [C] or type Set A, Set B, or Set C.');
              return;
            }
            const setMatch = trimmed.toUpperCase().match(/[ABC]/)?.[0];
            if (!setMatch || !['A', 'B', 'C'].includes(setMatch)) {
              pushAssistant('Enter A, B, or C to select the set.');
              return;
            }
            setFlow({
              action,
              step: 3,
              data: {
                ...data,
                currentSet: setMatch,
              },
            });
            pushAssistant(
              [
                `✓ Set ${setMatch} selected`,
                'Step 3 — Real-time point entry',
                'Use point buttons in the form below. Each click updates instantly.',
                `Rally to 21 points. Click "Undo" if you make a mistake.`,
                `When Set ${setMatch} finishes, select Set ${setMatch === 'A' ? 'B' : 'C'} or complete the match.`,
              ].join('\n')
            );
            return;
          }

          if (step === 2 && trimmed) {
            pushAssistant('Use the score form below for structured entry. Type cancel to abort.');
            return;
          }

          if (step === 3) {
            if (data.isCricket) {
              if (trimmed.toLowerCase() === 'cancel' || isNegative(trimmed)) {
                cancelFlow();
              } else {
                pushAssistant('For cricket, use the scoring form buttons above to save updates or start the next innings. Type cancel to exit the assistant.');
              }
              return;
            }

            if (data.isShuttle) {
              if (trimmed.toLowerCase() === 'cancel' || isNegative(trimmed)) {
                cancelFlow();
              } else if (trimmed.toUpperCase().match(/[ABC]/)) {
                const newSet = trimmed.toUpperCase().match(/[ABC]/)?.[0];
                if (newSet && ['A', 'B', 'C'].includes(newSet)) {
                  setFlow({
                    action,
                    step: 3,
                    data: {
                      ...data,
                      currentSet: newSet,
                    },
                  });
                  pushAssistant(
                    [
                      `✓ Set ${newSet} selected`,
                      'Continue with real-time point entry.',
                    ].join('\n')
                  );
                  return;
                }
              }
              pushAssistant('For shuttle, use the point buttons [+A] [+B] in the form. Type a set letter (A/B/C) to switch sets. Type cancel to finish.');
              return;
            }

            if (isNegative(trimmed)) {
              cancelFlow();
              return;
            }
            if (!isAffirmative(trimmed)) {
              pushAssistant('Reply yes to save or no to cancel.');
              return;
            }
            const matchId = String(data.matchId);
            const payload = data.scorePayload as Record<string, unknown> | undefined;
            if (!payload || typeof payload !== 'object') {
              pushAssistant('Missing score payload — go back and use Review update from the form.');
              return;
            }
            await api.putJson(`/api/matches/${matchId}/score`, payload);
            pushAssistant('Score saved ✓ Fans will see the update in real time (socket).');
            stagedHighlightVideoRef.current = null;
            setFlow(null);
            return;
          }
        }

        if (action === 'create_match') {
          if (step === 1) {
            if (!trimmed) {
              pushAssistant('Enter a team name.');
              return;
            }
            setFlow({ action, step: 2, data: { ...data, teamAName: trimmed } });
            pushAssistant('Step 2 — Enter name for Team B.');
            return;
          }
          if (step === 2) {
            if (!trimmed) {
              pushAssistant('Enter Team B name.');
              return;
            }
            setFlow({ action, step: 3, data: { ...data, teamBName: trimmed } });
            pushAssistant('Step 3 — Enter match date (YYYY-MM-DD).');
            return;
          }
          if (step === 3) {
            if (!/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
              pushAssistant('Use ISO date format YYYY-MM-DD.');
              return;
            }
            const teams = await fetchTeams(sportId);
            const teamAName = String(data.teamAName);
            const teamBName = String(data.teamBName);
            const ta = findTeamByName(teams, teamAName);
            const tb = findTeamByName(teams, teamBName);
            if (!ta || !tb) {
              pushAssistant(
                (!ta && !tb
                  ? `Neither team matched an existing roster. Add teams first or use exact names.\nTeam A input: ${teamAName}\nTeam B input: ${teamBName}`
                  : !ta
                    ? `Could not match Team A "${teamAName}" to a team in this sport.`
                    : `Could not match Team B "${teamBName}" to a team in this sport.`
                ) + '\n\nType cancel to abort, then start Create Match again with different names.'
              );
              return;
            }
            if (ta._id === tb._id) {
              pushAssistant('Both sides resolved to the same team — pick two different teams.');
              return;
            }

            if (sportSlug.toLowerCase() === 'cricket') {
              setFlow({
                action,
                step: 4,
                data: {
                  ...data,
                  date: trimmed,
                  teamAId: ta._id,
                  teamBId: tb._id,
                  teamAResolved: ta.name,
                  teamBResolved: tb.name,
                },
              });
              pushAssistant(
                [
                  'Step 4 — Enter total overs for this cricket match.',
                  'Type a number such as 20 or 50.',
                ].join('\n')
              );
              return;
            }

            setFlow({
              action,
              step: 4,
              data: {
                ...data,
                date: trimmed,
                teamAId: ta._id,
                teamBId: tb._id,
                teamAResolved: ta.name,
                teamBResolved: tb.name,
              },
            });
            pushAssistant(
              [
                'Step 4 — Summary',
                `${ta.name} vs ${tb.name}`,
                `Date: ${trimmed}`,
                'Sport: current admin sport',
                '',
                'Create this match? (yes / no)',
              ].join('\n')
            );
            return;
          }
          if (step === 4 && sportSlug.toLowerCase() === 'cricket') {
            if (!trimmed) {
              pushAssistant('Enter number of overs, for example 20 or 50.');
              return;
            }
            const totalOvers = parseInt(trimmed, 10);
            if (isNaN(totalOvers) || totalOvers <= 0) {
              pushAssistant('Enter a valid positive overs number.');
              return;
            }
            setFlow({
              action,
              step: 5,
              data: {
                ...data,
                totalOvers,
              },
            });
            pushAssistant(
              [
                'Step 5 — Summary',
                `${String(data.teamAResolved)} vs ${String(data.teamBResolved)}`,
                `Date: ${String(data.date)}`,
                `Total overs: ${totalOvers}`,
                'Sport: cricket',
                '',
                'Create this match? (yes / no)',
              ].join('\n')
            );
            return;
          }
          if (step === 4 && sportSlug.toLowerCase() !== 'cricket') {
            if (isNegative(trimmed)) {
              cancelFlow();
              return;
            }
            if (!isAffirmative(trimmed)) {
              pushAssistant('Reply yes to create or no to cancel.');
              return;
            }
            await api.postJson('/api/matches', {
              sportId,
              teamAId: data.teamAId,
              teamBId: data.teamBId,
              date: data.date,
              status: 'upcoming',
              scoreA: 0,
              scoreB: 0,
            });
            pushAssistant('Match created ✓ It will appear on the schedule and via live sockets.');
            setFlow(null);
            return;
          }
          if (step === 5 && sportSlug.toLowerCase() === 'cricket') {
            if (isNegative(trimmed)) {
              cancelFlow();
              return;
            }
            if (!isAffirmative(trimmed)) {
              pushAssistant('Reply yes to create or no to cancel.');
              return;
            }
            await api.postJson('/api/matches', {
              sportId,
              teamAId: data.teamAId,
              teamBId: data.teamBId,
              date: data.date,
              status: 'upcoming',
              scoreA: 0,
              scoreB: 0,
              totalOvers: data.totalOvers,
            });
            pushAssistant('Match created ✓ It will appear on the schedule and via live sockets.');
            setFlow(null);
            return;
          }
        }

        if (action === 'manage_teams') {
          if (step === 1) {
            if (!trimmed) {
              pushAssistant('Enter a team name.');
              return;
            }
            setFlow({ action, step: 2, data: { ...data, name: trimmed } });
            pushAssistant('Step 2 — Number of players (optional). Press Send with empty box to default to 1.');
            return;
          }
          if (step === 2) {
            let players = 1;
            if (trimmed) {
              const p = parseScore(trimmed);
              if (p === null || p < 1) {
                pushAssistant('Enter a positive player count or leave empty for 1.');
                return;
              }
              players = p;
            }
            setFlow({ action, step: 3, data: { ...data, players } });
            pushAssistant(
              [`Create team "${String(data.name)}" with ${players} player(s)?`, '', 'Confirm (yes / no)'].join('\n')
            );
            return;
          }
          if (step === 3) {
            if (isNegative(trimmed)) {
              cancelFlow();
              return;
            }
            if (!isAffirmative(trimmed)) {
              pushAssistant('Reply yes to add the team or no to cancel.');
              return;
            }
            await api.postJson('/api/teams', {
              name: String(data.name),
              sportId,
              players: Number(data.players) || 1,
            });
            pushAssistant('Team saved ✓');
            setFlow(null);
            return;
          }
        }

        if (action === 'add_highlights') {
          if (step === 1) {
            if (!trimmed) {
              pushAssistant('Enter a title for the highlight.');
              return;
            }
            setFlow({ action, step: 2, data: { ...data, title: trimmed } });
            pushAssistant(
              'Step 2 — Link to a match (optional).\nEnter Team A vs Team B, or type **skip** for a sport-wide highlight.'
            );
            return;
          }
          if (step === 2) {
            let matchId: string | undefined;
            if (opts?.skipMatchLink) {
              matchId = undefined;
            } else if (opts?.selectedMatchId) {
              const matches = await fetchMatches(sportId);
              const found = matches.find((m) => m._id === opts.selectedMatchId);
              if (!found) {
                pushAssistant('Match not found ❌ Pick again or tap Skip match link.');
                return;
              }
              matchId = found._id;
            } else if (trimmed.toLowerCase() !== 'skip') {
              const parsed = parseVsInput(trimmed);
              if (!parsed) {
                pushAssistant('Use Team A vs Team B, pick from the list, or type skip.');
                return;
              }
              const matches = await fetchMatches(sportId);
              const found = findMatchByTeamNames(matches, parsed[0], parsed[1]);
              if (!found) {
                pushAssistant('Match not found ❌ Try again or type skip.');
                return;
              }
              matchId = found._id;
            }
            setFlow({ action, step: 3, data: { ...data, matchId } });
            pushAssistant(
              'Step 3 — Add video: choose a file below **or** paste a video URL in the box and send.\nSupported: MP4, MOV, WebM (same as manual highlights).'
            );
            return;
          }
          if (step === 3) {
            const urlFromText = (trimmed || videoUrlHint).trim();
            if (videoFile) {
              stagedHighlightVideoRef.current = videoFile;
            } else {
              stagedHighlightVideoRef.current = null;
            }
            if (!videoFile && !urlFromText) {
              pushAssistant('Upload a video file or paste a URL, then send.');
              return;
            }
            setFlow({
              action,
              step: 4,
              data: { ...data, highlightVideoUrl: videoFile ? '' : urlFromText },
            });
            pushAssistant('Step 4 — Enter a short description.');
            return;
          }
          if (step === 4) {
            setFlow({ action, step: 5, data: { ...data, description: trimmed } });
            const title = String(data.title);
            const hasMatch = data.matchId ? 'Linked to match' : 'Sport only';
            pushAssistant(
              [
                'Step 5 — Summary',
                `Title: ${title}`,
                formatMatchSummaryLine(data.matchId),
                `Description: ${trimmed || '—'}`,
                '',
                'Publish highlight? (yes / no)',
              ].join('\n')
            );
            return;
          }

          if (step === 5) {
            if (isNegative(trimmed)) {
              cancelFlow();
              return;
            }
            if (!isAffirmative(trimmed)) {
              pushAssistant('Reply yes to publish or no to cancel.');
              return;
            }

            const title = String(data.title);
            const fd = new FormData();
            fd.append('title', title);
            fd.append('sportId', sportId);
            if (data.matchId) fd.append('matchId', String(data.matchId));
            const desc = String(data.description || '');
            if (desc) fd.append('description', desc);
            fd.append('date', new Date().toISOString().split('T')[0]);

            const file = stagedHighlightVideoRef.current;
            const vUrl = String(data.highlightVideoUrl || '').trim();
            if (file) {
              fd.append('video', file);
            } else if (vUrl) {
              fd.append('videoUrl', vUrl);
            } else {
              pushAssistant('Missing video — restart Add Highlights and attach a file or URL.');
              stagedHighlightVideoRef.current = null;
              setFlow(null);
              return;
            }

            await api.postFormData('/api/highlights', fd);
            pushAssistant('Highlight published ✓');
            stagedHighlightVideoRef.current = null;
            setFlow(null);
            return;
          }
        }
      } catch (err) {
        pushAssistant(safeActionError(err, 'Something went wrong. Check your network and try again.'));
      } finally {
        setBusy(false);
      }
    },
    [sportId, sportSlug, flow, pushAssistant, pushUser, cancelFlow]
  );

  return {
    messages,
    flow,
    setFlow,
    busy,
    startFlow,
    submitUserText,
    submitSportScoreDraft,
    cancelFlow,
  };
}

function formatMatchSummaryLine(matchId: unknown): string {
  return matchId ? 'Match: linked' : 'Match: not linked (sport-wide)';
}
