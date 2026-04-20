'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { getSocket } from '@/lib/socket';
import {
  useAdminAssistant,
  type ChatLine,
  type FlowAction,
} from '@/hooks/use-admin-assistant';
import { useSpeechRecognition } from '@/hooks/use-speech-recognition';
import { api } from '@/lib/api';
import type { MatchListItem, TeamNameMatch } from '@/lib/admin-assistant-helpers';
import {
  getRecentMatchesForSport,
  rememberAssistantMatch,
  type RecentMatchEntry,
} from '@/lib/assistant-recent-matches';
import { AssistantLivePreview } from '@/components/admin-assistant/live-preview';
import { AssistantSportScoreForm } from '@/components/admin-assistant/sport-score-form';
import { AdminAssistantPlayerWorkflow } from '@/components/admin-assistant-player-workflow';
import {
  Loader2,
  MessageSquare,
  Mic,
  Radio,
  Send,
  Volume2,
  CalendarDays,
  ListOrdered,
} from 'lucide-react';

function matchLabel(m: MatchListItem): string {
  const a = m.teamA?.name || 'Team A';
  const b = m.teamB?.name || 'Team B';
  return `${a} vs ${b}`;
}

async function playAssistantTts(text: string) {
  const plain = text.replace(/\s+/g, ' ').trim().slice(0, 500);
  if (!plain) return;
  const res = await fetch('/api/assistant/tts', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text: plain }),
  });
  if (!res.ok) return;
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const audio = new Audio(url);
  audio.play();
  audio.onended = () => URL.revokeObjectURL(url);
}

function ChatBubble({ line }: { line: ChatLine }) {
  const isUser = line.role === 'user';
  return (
    <div className={cn('flex w-full mb-4 group/bub', isUser ? 'justify-end' : 'justify-start')}>
      <div className="flex flex-col gap-1 max-w-[85%]">
        <div
          className={cn(
            'rounded-2xl px-4 py-3 text-sm whitespace-pre-wrap shadow-sm border',
            isUser
              ? 'bg-[var(--sport-primary)] text-white border-[var(--sport-primary)] rounded-br-md'
              : 'bg-card text-foreground border-border rounded-bl-md'
          )}
        >
          {line.content}
        </div>
        {!isUser && (
          <div className="flex justify-start pl-1">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-7 px-2 text-[11px] text-muted-foreground opacity-0 group-hover/bub:opacity-100 transition-opacity"
              onClick={() => void playAssistantTts(line.content)}
              title="Read aloud (RapidAPI TTS)"
            >
              <Volume2 className="w-3.5 h-3.5 mr-1" />
              Listen
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

const ACTION_BUTTONS: { action: FlowAction; label: string }[] = [
  { action: 'update_score', label: 'Update Match Score' },
  { action: 'create_match', label: 'Create Match' },
  { action: 'manage_teams', label: 'Manage Teams' },
  { action: 'add_highlights', label: 'Add Highlights' },
];

const PLAYER_CHIPS = [1, 2, 5, 7, 11, 12, 15, 18];

function isoDate(d: Date) {
  return d.toISOString().split('T')[0];
}

interface AdminAssistantPanelProps {
  sportId: string | null;
  sportSlug: string;
  sportLoading: boolean;
}

export function AdminAssistantPanel({ sportId, sportSlug, sportLoading }: AdminAssistantPanelProps) {
  const [showPlayerWorkflow, setShowPlayerWorkflow] = useState(false);
  const [text, setText] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [videoPick, setVideoPick] = useState<File | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [fileInputKey, setFileInputKey] = useState(0);
  const [livePulse, setLivePulse] = useState(false);
  const [listsKey, setListsKey] = useState(0);
  const [matches, setMatches] = useState<MatchListItem[]>([]);
  const [teams, setTeams] = useState<TeamNameMatch[]>([]);
  const [listsLoading, setListsLoading] = useState(false);
  const [recentBump, setRecentBump] = useState(0);

  const speech = useSpeechRecognition((t) => setText((prev) => (prev ? `${prev} ${t}` : t)));

  const {
    messages,
    flow,
    setFlow,
    busy,
    startFlow,
    cancelFlow,
    submitUserText,
    submitSportScoreDraft,
  } = useAdminAssistant(sportId || '', sportSlug);

  const recentMatches = useMemo((): RecentMatchEntry[] => {
    if (!sportId) return [];
    return getRecentMatchesForSport(sportId);
  }, [sportId, recentBump]);

  useEffect(() => {
    if (!sportId) {
      setMatches([]);
      setTeams([]);
      return;
    }
    let cancelled = false;
    setListsLoading(true);
    (async () => {
      try {
        const [mRes, tRes] = await Promise.all([
          api.get<{ success: boolean; data: MatchListItem[] }>(
            `/api/matches?sportId=${encodeURIComponent(sportId)}`
          ),
          api.get<{ success: boolean; data: TeamNameMatch[] }>(
            `/api/teams?sportId=${encodeURIComponent(sportId)}`
          ),
        ]);
        if (cancelled) return;
        setMatches((mRes as { data?: MatchListItem[] }).data || []);
        setTeams((tRes as { data?: TeamNameMatch[] }).data || []);
      } catch {
        if (!cancelled) {
          setMatches([]);
          setTeams([]);
        }
      } finally {
        if (!cancelled) setListsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [sportId, listsKey]);

  useEffect(() => {
    if (!sportId) return;
    const socket = getSocket();
    const ping = () => {
      setLivePulse(true);
      window.setTimeout(() => setLivePulse(false), 1400);
    };
    const bump = () => setListsKey((k) => k + 1);
    const onScore = (m: { sport?: string }) => {
      if (m?.sport === sportId) {
        ping();
        bump();
      }
    };
    const onCreated = (m: { sport?: string }) => {
      if (m?.sport === sportId) {
        ping();
        bump();
      }
    };
    const onHighlight = (h: { sport?: string }) => {
      if (h?.sport === sportId) ping();
    };
    socket.on('scoreUpdated', onScore);
    socket.on('matchCreated', onCreated);
    socket.on('highlightAdded', onHighlight);
    return () => {
      socket.off('scoreUpdated', onScore);
      socket.off('matchCreated', onCreated);
      socket.off('highlightAdded', onHighlight);
    };
  }, [sportId]);

  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, flow, busy]);

  const showVideoStep = flow?.action === 'add_highlights' && flow.step === 3;

  const autocompleteItems = useMemo(() => {
    const q = text.trim().toLowerCase();
    if (!q || !flow || !sportId) return [] as { key: string; label: string; onPick: () => void }[];

    if (flow.action === 'update_score' && flow.step === 1) {
      return matches
        .filter((m) => matchLabel(m).toLowerCase().includes(q))
        .slice(0, 8)
        .map((m) => ({
          key: m._id,
          label: matchLabel(m),
          onPick: () => {
            rememberAssistantMatch(sportId, m._id, matchLabel(m));
            setRecentBump((x) => x + 1);
            void submitUserText(matchLabel(m), { selectedMatchId: m._id });
            setText('');
          },
        }));
    }

    if (flow.action === 'create_match' && (flow.step === 1 || flow.step === 2)) {
      const exclude =
        flow.step === 2 && flow.data.teamAName
          ? String(flow.data.teamAName).toLowerCase()
          : '';
      return teams
        .filter((t) => t.name.toLowerCase().includes(q))
        .filter((t) => (flow.step === 2 ? t.name.toLowerCase() !== exclude : true))
        .slice(0, 8)
        .map((t) => ({
          key: t._id,
          label: t.name,
          onPick: () => {
            void submitUserText(t.name);
            setText('');
          },
        }));
    }

    return [];
  }, [text, flow, sportId, matches, teams, submitUserText]);

  const handleSend = async () => {
    const t = text;
    setText('');
    await submitUserText(t, {
      videoFile: videoPick,
      videoUrlHint: videoUrl,
    });
    if (showVideoStep) {
      setVideoPick(null);
      setVideoUrl('');
      setFileInputKey((k) => k + 1);
    }
  };

  const pickMatch = (m: MatchListItem) => {
    if (!sportId) return;
    const label = matchLabel(m);
    rememberAssistantMatch(sportId, m._id, label);
    setRecentBump((x) => x + 1);
    void submitUserText(label, { selectedMatchId: m._id });
    setText('');
  };

  const pickRecent = (e: RecentMatchEntry) => {
    if (!sportId) return;
    void submitUserText(e.label, { selectedMatchId: e.id });
    setText('');
  };

  const onVideoDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files?.[0];
    if (!f) return;
    if (!/^video\//.test(f.type) && !/\.(mp4|mov|webm)$/i.test(f.name)) return;
    setVideoPick(f);
  };

  return (
    <div className="flex flex-col lg:flex-row flex-1 min-h-0 h-full gap-4 min-w-0">
      <div className="flex flex-col flex-1 min-h-0 min-w-0 border border-border rounded-xl overflow-hidden shadow-sm bg-background max-h-[calc(100dvh-2rem)] lg:max-h-none lg:h-full">
        {/* Header */}
        <div className="flex-shrink-0 border-b border-border bg-card px-4 sm:px-6 py-3 sm:py-4 flex flex-col gap-2">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="p-2 rounded-lg bg-[var(--sport-primary-muted)] shrink-0">
                <MessageSquare className="w-5 h-5 text-[var(--sport-primary)]" />
              </div>
              <div className="min-w-0">
                <h1 className="text-lg sm:text-xl font-bold tracking-tight truncate">ScoreVista Assistant</h1>
                <p className="text-xs text-muted-foreground capitalize truncate">Sport: {sportSlug}</p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={cn(
                  'inline-flex items-center gap-1.5 text-xs font-medium rounded-full px-2.5 py-1 border transition-colors',
                  livePulse
                    ? 'border-emerald-500/60 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                    : 'border-border bg-background text-muted-foreground'
                )}
              >
                <Radio className={cn('w-3.5 h-3.5', livePulse && 'animate-pulse')} />
                Real-time
              </span>
              <Button variant="outline" size="sm" asChild>
                <Link href={`/admin/dashboard?sport=${encodeURIComponent(sportSlug)}`}>
                  Manual mode
                </Link>
              </Button>
            </div>
          </div>
        </div>

        {/* Chat */}
        <ScrollArea className="flex-1 min-h-[200px] px-4 sm:px-6 py-4">
          <div className="max-w-3xl mx-auto pb-4">
            {(sportLoading || listsLoading) && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                <Loader2 className="w-4 h-4 animate-spin" />
                Loading…
              </div>
            )}
            {messages.map((m) => (
              <ChatBubble key={m.id} line={m} />
            ))}
            {busy && (
              <div className="flex justify-start mb-4">
                <div className="rounded-2xl px-4 py-2 border border-border bg-muted/40 text-sm text-muted-foreground flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Working…
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>
        </ScrollArea>

        {/* Flow shortcuts */}
        {flow && sportId && (
          <div className="flex-shrink-0 border-t border-border bg-muted/20 px-4 sm:px-6 py-3 space-y-3 max-h-[40vh] overflow-y-auto">
            <div className="max-w-3xl mx-auto space-y-3">
              {/* Match pickers */}
              {flow.action === 'update_score' && flow.step === 1 && (
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-muted-foreground flex items-center gap-1">
                    <ListOrdered className="w-3.5 h-3.5" />
                    Pick a match
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {matches.slice(0, 24).map((m) => (
                      <Button
                        key={m._id}
                        type="button"
                        size="sm"
                        variant="secondary"
                        className="h-auto py-2 px-3 text-left text-xs max-w-[220px] whitespace-normal"
                        disabled={busy}
                        onClick={() => pickMatch(m)}
                      >
                        {matchLabel(m)}
                      </Button>
                    ))}
                  </div>
                  {recentMatches.length > 0 && (
                    <div className="pt-2 border-t border-border/60">
                      <p className="text-[11px] font-semibold text-muted-foreground mb-2">Recent</p>
                      <div className="flex flex-wrap gap-2">
                        {recentMatches.map((e) => (
                          <Button
                            key={`${e.id}-${e.ts}`}
                            type="button"
                            size="sm"
                            variant="outline"
                            className="h-auto py-1.5 px-2 text-[11px] max-w-[200px] whitespace-normal"
                            disabled={busy}
                            onClick={() => pickRecent(e)}
                          >
                            {e.label}
                          </Button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {flow.action === 'update_score' && flow.data.matchId && (
                ((flow.data.isCricket && flow.step === 3) || (flow.data.isShuttle && flow.step === 3) || (!flow.data.isCricket && !flow.data.isShuttle && flow.step === 2)) && (
                  <AssistantSportScoreForm
                    key={`${sportSlug}-${String(flow.data.matchId)}-${flow.step}-${flow.data.refreshInnings || 0}-${flow.data.currentSet || ''}`}
                    sportSlug={sportSlug}
                    teamALabel={String(flow.data.teamALabel || 'Team A')}
                    teamBLabel={String(flow.data.teamBLabel || 'Team B')}
                    matchId={String(flow.data.matchId)}
                    totalOvers={typeof flow.data.totalOvers === 'number' ? flow.data.totalOvers : undefined}
                    disabled={busy}
                    onReview={(draft) => submitSportScoreDraft(draft)}
                    onInningsUpdated={() => setFlow((f) => f ? { ...f, data: { ...f.data, refreshInnings: (f.data.refreshInnings || 0) + 1 } } : null)}
                  />
                )
              )}

              {flow.action === 'add_highlights' && flow.step === 2 && (
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-muted-foreground">Link to match (optional)</p>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      disabled={busy}
                      onClick={() => void submitUserText('', { skipMatchLink: true })}
                    >
                      Skip — sport-wide
                    </Button>
                    {matches.slice(0, 20).map((m) => (
                      <Button
                        key={m._id}
                        type="button"
                        size="sm"
                        variant="secondary"
                        className="h-auto py-2 px-3 text-xs max-w-[200px] whitespace-normal"
                        disabled={busy}
                        onClick={() => {
                          const label = matchLabel(m);
                          rememberAssistantMatch(sportId, m._id, label);
                          setRecentBump((x) => x + 1);
                          void submitUserText(label, { selectedMatchId: m._id });
                        }}
                      >
                        {matchLabel(m)}
                      </Button>
                    ))}
                  </div>
                </div>
              )}

              {/* Team picks */}
              {flow.action === 'create_match' && (flow.step === 1 || flow.step === 2) && (
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-muted-foreground">
                    Quick pick team {flow.step === 1 ? 'A' : 'B'}
                  </p>
                  <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
                    {teams
                      .filter((t) =>
                        flow.step === 2 && flow.data.teamAName
                          ? t.name.toLowerCase() !== String(flow.data.teamAName).toLowerCase()
                          : true
                      )
                      .map((t) => (
                        <Button
                          key={t._id}
                          type="button"
                          size="sm"
                          variant="secondary"
                          disabled={busy}
                          onClick={() => void submitUserText(t.name)}
                        >
                          {t.name}
                        </Button>
                      ))}
                  </div>
                </div>
              )}

              {/* Date presets */}
              {flow.action === 'create_match' && flow.step === 3 && (
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-muted-foreground flex items-center gap-1">
                    <CalendarDays className="w-3.5 h-3.5" />
                    Quick date
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      disabled={busy}
                      onClick={() => void submitUserText(isoDate(new Date()))}
                    >
                      Today
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      disabled={busy}
                      onClick={() => void submitUserText(isoDate(new Date(Date.now() + 864e5)))}
                    >
                      Tomorrow
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      disabled={busy}
                      onClick={() => void submitUserText(isoDate(new Date(Date.now() + 7 * 864e5)))}
                    >
                      +7 days
                    </Button>
                  </div>
                </div>
              )}

              {/* Players */}
              {flow.action === 'manage_teams' && flow.step === 2 && (
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-muted-foreground">Players</p>
                  <div className="flex flex-wrap gap-1.5">
                    {PLAYER_CHIPS.map((n) => (
                      <Button
                        key={n}
                        type="button"
                        size="sm"
                        variant="outline"
                        className="h-8 w-10 px-0"
                        disabled={busy}
                        onClick={() => void submitUserText(String(n))}
                      >
                        {n}
                      </Button>
                    ))}
                  </div>
                </div>
              )}

              {flow.action === 'add_highlights' && flow.step === 4 && (
                <div className="flex flex-wrap gap-2">
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    disabled={busy}
                    onClick={() => void submitUserText('')}
                  >
                    Skip description
                  </Button>
                </div>
              )}

              {/* Yes / No */}
              {((flow.action === 'update_score' && flow.step === 3 && !flow.data.isCricket) ||
                (flow.action === 'create_match' && flow.step === 4) ||
                (flow.action === 'manage_teams' && flow.step === 3) ||
                (flow.action === 'add_highlights' && flow.step === 5)) && (
                <div className="flex flex-wrap gap-2">
                  <Button type="button" size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white" disabled={busy} onClick={() => void submitUserText('yes')}>
                    Confirm
                  </Button>
                  <Button type="button" size="sm" variant="outline" disabled={busy} onClick={() => void submitUserText('no')}>
                    Cancel
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}

        {!flow && (
          <div className="flex-shrink-0 border-t border-border bg-card/80 px-4 sm:px-6 py-3">
            <div className="max-w-3xl mx-auto flex flex-wrap gap-2">
              {ACTION_BUTTONS.map((b) => (
                <Button
                  key={b.action}
                  type="button"
                  variant="secondary"
                  size="sm"
                  className="rounded-full border border-border hover:bg-[var(--sport-primary-muted)] hover:border-[var(--sport-primary)]/40"
                  disabled={!sportId || sportLoading || busy}
                  onClick={() => startFlow(b.action)}
                >
                  {b.label}
                </Button>
              ))}
            </div>
          </div>
        )}

        {flow && (
          <div className="flex-shrink-0 px-4 sm:px-6 pb-1">
            <div className="max-w-3xl mx-auto flex justify-end">
              <Button type="button" variant="ghost" size="sm" className="text-muted-foreground" onClick={cancelFlow} disabled={busy}>
                Cancel flow
              </Button>
            </div>
          </div>
        )}

        {/* Composer */}
        <div className="flex-shrink-0 border-t border-border bg-card p-4 sm:px-6">
          <div className="max-w-3xl mx-auto space-y-3">
            {showVideoStep && (
              <div
                className={cn(
                  'rounded-lg border-2 border-dashed bg-background p-3 space-y-2 transition-colors',
                  dragOver ? 'border-[var(--sport-primary)] bg-[var(--sport-primary-muted)]' : 'border-border'
                )}
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragOver(true);
                }}
                onDragLeave={() => setDragOver(false)}
                onDrop={onVideoDrop}
              >
                <p className="text-xs font-medium text-muted-foreground">Video — drag & drop or choose file / URL</p>
                <div className="flex flex-col sm:flex-row gap-2">
                  <Input
                    key={fileInputKey}
                    type="file"
                    accept="video/mp4,video/quicktime,video/webm"
                    className="cursor-pointer"
                    onChange={(e) => setVideoPick(e.target.files?.[0] ?? null)}
                  />
                  <Input
                    placeholder="Video URL"
                    value={videoUrl}
                    onChange={(e) => setVideoUrl(e.target.value)}
                    className="sm:flex-1"
                  />
                </div>
              </div>
            )}
            <div className="relative">
              {autocompleteItems.length > 0 && (
                <ul className="absolute bottom-full left-0 right-0 mb-1 max-h-48 overflow-y-auto rounded-lg border border-border bg-popover shadow-md z-20">
                  {autocompleteItems.map((item) => (
                    <li key={item.key}>
                      <button
                        type="button"
                        className="w-full text-left px-3 py-2 text-xs hover:bg-muted transition-colors"
                        onClick={() => item.onPick()}
                      >
                        {item.label}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
              <div className="flex gap-2">
                <Input
                  placeholder={
                    showVideoStep
                      ? 'Optional note — Send applies file/URL'
                      : 'Type or use shortcuts above…'
                  }
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      void handleSend();
                    }
                  }}
                  disabled={busy || sportLoading || !sportId}
                  className="flex-1 bg-background"
                />
                {speech.supported && (
                  <Button
                    type="button"
                    variant={speech.listening ? 'destructive' : 'outline'}
                    size="icon"
                    className="shrink-0"
                    disabled={busy || sportLoading || !sportId}
                    title={speech.listening ? 'Stop' : 'Voice input'}
                    onClick={() => (speech.listening ? speech.stop() : speech.start())}
                  >
                    <Mic className="w-4 h-4" />
                  </Button>
                )}
                <Button
                  type="button"
                  className="bg-[var(--sport-primary)] hover:opacity-90 text-white shrink-0"
                  onClick={() => void handleSend()}
                  disabled={busy || sportLoading || !sportId}
                >
                  {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                </Button>
              </div>
              {speech.error && <p className="text-[11px] text-destructive">{speech.error}</p>}
            </div>
            <p className="text-[11px] text-muted-foreground">
              Same backend APIs as manual admin. Mic uses browser speech-to-text. Listen uses server TTS (set{' '}
              <code className="text-[10px]">RAPIDAPI_KEY</code>).
            </p>
          </div>
        </div>
      </div>

      {/* Preview sidebar */}
      <aside className="lg:w-80 flex-shrink-0 flex flex-col gap-3 min-h-0 order-first lg:order-none">
        <AssistantLivePreview flow={flow} sportSlug={sportSlug} />
        {sportId && recentMatches.length > 0 && (
          <div className="rounded-xl border border-border bg-card p-3 text-xs">
            <p className="font-semibold text-muted-foreground mb-2">Recent matches</p>
            <div className="flex flex-col gap-1">
              {recentMatches.slice(0, 5).map((e) => (
                <button
                  key={`${e.id}-${e.ts}`}
                  type="button"
                  className={cn(
                    'text-left truncate py-0.5 rounded px-1 -mx-1',
                    flow?.action === 'update_score' && flow.step === 1 && !busy
                      ? 'hover:bg-muted hover:text-[var(--sport-primary)]'
                      : 'opacity-50 cursor-not-allowed'
                  )}
                  onClick={() => {
                    if (flow?.action === 'update_score' && flow.step === 1 && !busy) pickRecent(e);
                  }}
                  disabled={flow?.action !== 'update_score' || flow.step !== 1 || busy}
                >
                  {e.label}
                </button>
              ))}
            </div>
            {(!flow || flow.action !== 'update_score' || flow.step !== 1) && (
              <p className="text-[10px] text-muted-foreground mt-2">Open “Update Match Score” (step 1) to reuse a recent match.</p>
            )}
          </div>
        )}
      </aside>
    </div>
  );
}
