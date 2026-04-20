'use client';

import { useMemo, useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { getScoreConfigBySport, type SportScoreDraft } from '@/lib/sport-scoring';
import { 
  processCricketBallEvent, 
  formatCricketScoreDisplay,
  getQuickActionsBySport,
  CRICKET_BALL_BUTTONS,
  type CricketBallEvent
} from '@/lib/sport-specific-actions';
import { api } from '@/lib/api';
import { Loader2, RotateCcw } from 'lucide-react';

interface SportScoreFormProps {
  sportSlug: string;
  teamALabel: string;
  teamBLabel: string;
  matchId?: string;
  totalOvers?: number;
  disabled?: boolean;
  onReview?: (draft: SportScoreDraft) => void;
  onInningsUpdated?: () => void;
}

export function AssistantSportScoreForm({
  sportSlug,
  teamALabel,
  teamBLabel,
  matchId,
  totalOvers,
  disabled,
  onReview,
  onInningsUpdated,
}: SportScoreFormProps) {
  const config = useMemo(() => getScoreConfigBySport(sportSlug), [sportSlug]);
  const setRows = config.defaultSetRows ?? 3;
  const quickActions = useMemo(() => getQuickActionsBySport(sportSlug), [sportSlug]);

  const [values, setValues] = useState<Record<string, string>>({});
  const [setPairs, setSetPairs] = useState<string[]>(() => Array.from({ length: setRows }, () => ''));
  const [status, setStatus] = useState<'live' | 'completed'>('live');

  // Cricket: Real-time state
  const [cricketInnings, setCricketInnings] = useState({
    runs: 0,
    wickets: 0,
    balls: [] as Array<{ event: CricketBallEvent; timestamp: Date; ballRunsScored?: number }>,
    totalOvers: 20,
    currentInningsNum: 1,
    target: 0,
  });
  const [matchInnings, setMatchInnings] = useState<any[]>([]);
  const [updating, setUpdating] = useState(false);

  // Shuttle: Real-time state
  const [shuttleSetScores, setShuttleSetScores] = useState({
    setA: { playerA: 0, playerB: 0 },
    setB: { playerA: 0, playerB: 0 },
    setC: { playerA: 0, playerB: 0 },
  });
  const [currentShuttleSet, setCurrentShuttleSet] = useState<'A' | 'B' | 'C'>('A');
  const [completedShuttleSets, setCompletedShuttleSets] = useState<Set<'A' | 'B' | 'C'>>(new Set());

  const hasSetPairs = config.fields.some((f) => f.type === 'setPairs');
  const isCricket = (sportSlug || '').toLowerCase() === 'cricket';
  const isShuttle = (sportSlug || '').toLowerCase() === 'shuttle';

  // Initialize cricket data from existing match
  useEffect(() => {
    if (isCricket && matchId) {
      const loadMatchData = async () => {
        try {
          const res = await api.get<any>(`/api/matches/${matchId}`);
          if (res && res.data && res.data.sportScore) {
            const innings = res.data.sportScore.innings || [];
            const currentInningsNum = res.data.sportScore.currentInningsNum || 1;
            const selectedInnings = innings.find((i: any) => i.inningsNum === currentInningsNum) || innings[0];
            if (selectedInnings) {
              setMatchInnings(innings);
              setCricketInnings({
                runs: selectedInnings.runs || 0,
                wickets: selectedInnings.wickets || 0,
                balls: selectedInnings.balls || [],
                totalOvers:
                  typeof totalOvers === 'number' && totalOvers > 0
                    ? totalOvers
                    : selectedInnings.totalOvers || 20,
                currentInningsNum: selectedInnings.inningsNum || 1,
                target: selectedInnings.target || 0,
              });
            }
          }
        } catch (err) {
          console.error('Failed to load match data:', err);
        }
      };
      loadMatchData();
    }
  }, [isCricket, matchId, totalOvers]);

  // Auto-set status to 'Completed' when cricket innings is complete
  useEffect(() => {
    if (isCricket) {
      const currentOvers = calculateOvers(cricketInnings.balls);
      const oversNum = parseInt(currentOvers.split('.')[0], 10);
      const isInningsComplete = oversNum >= cricketInnings.totalOvers || cricketInnings.wickets >= 10;
      if (isInningsComplete && cricketInnings.currentInningsNum === 1 && status === 'live') {
        setStatus('completed');
      }
    }
  }, [isCricket, cricketInnings.balls, cricketInnings.totalOvers, cricketInnings.wickets, cricketInnings.currentInningsNum, status]);

  const buildDraft = (): SportScoreDraft => {
    if (isCricket) {
      return {
        status,
        cricketInnings: {
          runs: cricketInnings.runs,
          wickets: cricketInnings.wickets,
          overs: calculateOvers(cricketInnings.balls),
          balls: cricketInnings.balls,
          totalOvers: cricketInnings.totalOvers,
          currentInningsNum: cricketInnings.currentInningsNum,
          target: cricketInnings.target,
        },
      };
    }

    const draft: SportScoreDraft = { ...values, status };
    if (hasSetPairs) {
      draft.setPairs = setPairs.map((s) => s.trim()).filter(Boolean);
    }
    return draft;
  };

  const calculateOvers = (balls: any[]): string => {
    let legalBalls = 0;
    for (const ball of balls) {
      const isExtra = 
        ball.event === 'wide' || 
        ball.event === 'noBall' || 
        ball.event === 'legBye' || 
        ball.event === 'bye';
      if (!isExtra) legalBalls += 1;
    }
    const oversNum = Math.floor(legalBalls / 6);
    const ballsInOver = legalBalls % 6;
    return `${oversNum}.${ballsInOver}`;
  };

  const handleCricketBallEvent = async (buttonId: string) => {
    if (!isCricket || updating) return;

    const event = buttonId as CricketBallEvent;
    setUpdating(true);

    try {
      // Process ball locally first
      const state = {
        inningsNum: 1,
        battingTeamId: 'temp',
        bowlingTeamId: 'temp',
        balls: cricketInnings.balls,
      };

      const result = processCricketBallEvent(event, state as any);

      // Update local state
      const newBalls = [...cricketInnings.balls, { event, timestamp: new Date() }];
      const overs = calculateOvers(newBalls);

      setCricketInnings({
        ...cricketInnings,
        runs: result.runs,
        wickets: result.wickets,
        balls: newBalls,
      });

      // Send to backend instant
      if (matchId) {
        await api.postJson(`/api/matches/${matchId}/cricket-ball`, {
          event,
          runs: result.runs,
          wickets: result.wickets,
          overs,
          totalBalls: newBalls.length,
          totalOvers: cricketInnings.totalOvers,
        });
      }
    } catch (err) {
      console.error('Failed to process ball:', err);
    } finally {
      setUpdating(false);
    }
  };

  const handleUndo = async () => {
    if (cricketInnings.balls.length === 0 || updating) return;

    setUpdating(true);
    try {
      // Remove last ball
      const newBalls = cricketInnings.balls.slice(0, -1);
      
      // Recalculate score from remaining balls
      let runs = 0;
      let wickets = 0;
      for (const ball of newBalls) {
        if (ball.event.startsWith('runs-')) {
          const runsValue = parseInt(ball.event.split('-')[1]);
          runs += runsValue;
        } else if (ball.event === 'wicket') {
          wickets += 1;
        } else if (['wide', 'noBall', 'legBye', 'bye'].includes(ball.event)) {
          runs += 1;
        }
      }

      const overs = calculateOvers(newBalls);

      setCricketInnings({
        ...cricketInnings,
        runs,
        wickets,
        balls: newBalls,
      });

      // Send undo to backend
      if (matchId) {
        await api.postJson(`/api/matches/${matchId}/cricket-ball-undo`, {
          runs,
          wickets,
          overs,
          totalBalls: newBalls.length,
        });
      }
    } catch (err) {
      console.error('Failed to undo:', err);
    } finally {
      setUpdating(false);
    }
  };

  const handleCricketSave = async () => {
    if (!matchId || updating) return;
    setUpdating(true);
    try {
      const currentOvers = calculateOvers(cricketInnings.balls);
      const oversNum = parseInt(currentOvers.split('.')[0], 10);
      const isInningsComplete = oversNum >= cricketInnings.totalOvers || cricketInnings.wickets >= 10;
      
      const payload = {
        status,
        sportScore: {
          sportSlug: 'cricket',
          currentInningsNum: cricketInnings.currentInningsNum,
          innings: [
            {
              inningsNum: cricketInnings.currentInningsNum,
              runs: cricketInnings.runs,
              wickets: cricketInnings.wickets,
              overs: currentOvers,
              balls: cricketInnings.balls,
              status: (status === 'completed' || isInningsComplete) ? 'completed' : 'live',
              target: cricketInnings.target,
              totalOvers: cricketInnings.totalOvers,
            },
          ],
        },
      };
      
      const res = await api.putJson(`/api/matches/${matchId}/score`, payload);
      
      // Reload match data to confirm save
      const reloadRes = await api.get<any>(`/api/matches/${matchId}`);
      if (reloadRes && reloadRes.data && reloadRes.data.sportScore) {
        const innings = reloadRes.data.sportScore.innings || [];
        const currentInningsNum = reloadRes.data.sportScore.currentInningsNum || 1;
        const selectedInnings = innings.find((i: any) => i.inningsNum === currentInningsNum);
        if (selectedInnings) {
          setMatchInnings(innings);
          setCricketInnings({
            runs: selectedInnings.runs || 0,
            wickets: selectedInnings.wickets || 0,
            balls: selectedInnings.balls || [],
            totalOvers: selectedInnings.totalOvers || 20,
            currentInningsNum: selectedInnings.inningsNum || 1,
            target: selectedInnings.target || 0,
          });
          setStatus(reloadRes.data.status === 'completed' ? 'completed' : 'live');
        }
      }
    } catch (err: any) {
      let errorMessage = 'Score save failed';
      if (err && typeof err === 'object' && err.message) {
        errorMessage = err.message;
      } else if (typeof err === 'string') {
        errorMessage = err;
      }
      console.error('Failed to save cricket score:', errorMessage);
      alert(`Error saving score: ${errorMessage}`);
    } finally {
      setUpdating(false);
    }
  };

  // SHUTTLE HANDLERS
  const handleShuttlePoint = (player: 'A' | 'B') => {
    if (!isShuttle) return;
    
    setShuttleSetScores((prev) => {
      const setKey = `set${currentShuttleSet}` as keyof typeof prev;
      const currentSet = prev[setKey];
      const updated = { ...currentSet };
      
      if (player === 'A') {
        updated.playerA += 1;
      } else {
        updated.playerB += 1;
      }
      
      // Check if set is won (21 points)
      if (updated.playerA === 21 || updated.playerB === 21) {
        setCompletedShuttleSets((prev) => new Set([...Array.from(prev), currentShuttleSet]));
      }
      
      return { ...prev, [setKey]: updated };
    });
  };

  const handleShuttleUndo = () => {
    if (!isShuttle) return;
    
    setShuttleSetScores((prev) => {
      const setKey = `set${currentShuttleSet}` as keyof typeof prev;
      const currentSet = prev[setKey];
      const updated = { ...currentSet };
      
      if (updated.playerA > 0) {
        updated.playerA -= 1;
      } else if (updated.playerB > 0) {
        updated.playerB -= 1;
      }
      
      return { ...prev, [setKey]: updated };
    });
  };

  const handleShuttleSwitchSet = (set: 'A' | 'B' | 'C') => {
    if (!isShuttle) return;
    setCurrentShuttleSet(set);
  };

  const handleShuttleSave = async () => {
    if (!matchId || !isShuttle || updating) return;
    setUpdating(true);
    try {
      const payload = {
        status,
        sportScore: {
          sportSlug: 'shuttle',
          setA: shuttleSetScores.setA,
          setB: shuttleSetScores.setB,
          setC: shuttleSetScores.setC,
        },
      };
      
      await api.putJson(`/api/matches/${matchId}/score`, payload);
    } catch (err: any) {
      let errorMessage = 'Score save failed';
      if (err && typeof err === 'object' && err.message) {
        errorMessage = err.message;
      }
      console.error('Failed to save shuttle score:', errorMessage);
      alert(`Error saving score: ${errorMessage}`);
    } finally {
      setUpdating(false);
    }
  };

  if (isCricket) {
    const currentOvers = calculateOvers(cricketInnings.balls);
      const oversNum = parseInt(currentOvers.split('.')[0], 10);
      const isInningsComplete = oversNum >= cricketInnings.totalOvers || cricketInnings.wickets >= 10;
      const secondInningsExists = matchInnings.some((i) => i.inningsNum === 2);
      const battingTeamLabel = cricketInnings.currentInningsNum === 2 ? teamBLabel : teamALabel;
      const bowlingTeamLabel = cricketInnings.currentInningsNum === 2 ? teamALabel : teamBLabel;
    // Get last 6 balls for display
    const lastSixBalls = cricketInnings.balls.slice(-6);

    return (
      <div className="rounded-xl border border-border bg-card p-4 space-y-4">
        <div>
          <p className="text-xs font-semibold" style={{ color: 'var(--sport-primary)' }}>
            Cricket — Real-Time Scoring
          </p>
          <p className="text-[11px] text-muted-foreground mt-0.5">
            {teamALabel} vs {teamBLabel}
          </p>
        </div>

        {/* LIVE SCORE DISPLAY - BIG AND BOLD */}
        <div className="p-4 bg-blue-50 dark:bg-blue-950/30 rounded-lg border-2 border-blue-300 dark:border-blue-700">
          <div className="text-center">
            <p className="text-sm font-semibold text-blue-900 dark:text-blue-200 mb-1">
              {teamALabel}
            </p>
            <p className="text-4xl font-bold text-blue-700 dark:text-blue-300">
              {formatCricketScoreDisplay(cricketInnings.runs, cricketInnings.wickets, currentOvers)}
            </p>
            <p className="text-xs text-blue-600 dark:text-blue-400 mt-2">
              / {cricketInnings.totalOvers} overs
            </p>
          </div>
        </div>

        {cricketInnings.currentInningsNum === 2 && cricketInnings.target > 0 && (
          <div className="rounded-lg border border-slate-700/50 bg-slate-950/10 p-3">
            <p className="text-[10px] uppercase font-semibold text-muted-foreground">Chase target</p>
            <p className="text-sm font-bold text-emerald-500">{cricketInnings.target}</p>
            <p className="text-[11px] text-muted-foreground mt-1">
              Batting: {battingTeamLabel} • Bowling: {bowlingTeamLabel}
            </p>
          </div>
        )}

        {/* LAST 6 BALLS HISTORY */}
        <div className="space-y-2">
          <p className="text-[10px] font-semibold text-muted-foreground uppercase">Last 6 balls</p>
          <div className="flex gap-2">
            {lastSixBalls.length === 0 ? (
              <p className="text-[11px] text-muted-foreground italic">No balls yet</p>
            ) : (
              lastSixBalls.map((ball, idx) => (
                <div
                  key={idx}
                  className={cn(
                    'w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold',
                    ball.event === 'wicket'
                      ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
                      : ball.event.startsWith('runs-')
                        ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300'
                        : 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300'
                  )}
                >
                  {ball.event === 'wicket'
                    ? 'W'
                    : ball.event.startsWith('runs-')
                      ? ball.event.split('-')[1]
                      : ball.event === 'wide'
                        ? 'Wd'
                        : ball.event === 'noBall'
                          ? 'Nb'
                          : ball.event === 'legBye'
                            ? 'LB'
                            : 'B'}
                </div>
              ))
            )}
          </div>
        </div>

        {/* BALL EVENT BUTTONS - REAL-TIME */}
        {!isInningsComplete && (
          <div className="space-y-2 p-3 bg-muted/30 rounded-lg border border-border/50">
            <p className="text-[10px] font-semibold text-muted-foreground uppercase">
              ⚾ Click to add ball (instant update)
            </p>
            <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
              {CRICKET_BALL_BUTTONS.map((btn) => (
                <button
                  key={btn.id}
                  onClick={() => handleCricketBallEvent(btn.id)}
                  disabled={updating || disabled}
                  className={cn(
                    'p-2 rounded-lg border text-xs font-bold transition-all',
                    'disabled:opacity-50 disabled:cursor-not-allowed',
                    'hover:shadow-md active:scale-95',
                    btn.id === 'wicket'
                      ? 'bg-red-100 dark:bg-red-950/30 border-red-300 dark:border-red-700 text-red-700 dark:text-red-300 hover:bg-red-200 dark:hover:bg-red-900/40'
                      : btn.id.startsWith('runs-')
                        ? 'bg-emerald-100 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-700 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-200 dark:hover:bg-emerald-900/40'
                        : 'bg-amber-100 dark:bg-amber-950/30 border-amber-300 dark:border-amber-700 text-amber-700 dark:text-amber-300 hover:bg-amber-200 dark:hover:bg-amber-900/40'
                  )}
                >
                  <div className="flex flex-col items-center">
                    <span className="text-[7px] opacity-70">{btn.icon}</span>
                    <span>{btn.label}</span>
                  </div>
                </button>
              ))}
            </div>
            <p className="text-[9px] text-muted-foreground italic">
              Click a button for each ball. Updates instantly to database and all viewers.
            </p>
          </div>
        )}

        {/* SECOND INNINGS START */}
        {cricketInnings.currentInningsNum === 1 && isInningsComplete && !secondInningsExists && (
          <div className="p-3 rounded-lg border border-slate-700/60 bg-slate-950/10">
            <p className="text-sm font-semibold text-slate-100">First innings complete.</p>
            <p className="text-[11px] text-muted-foreground mt-1">
              Start the second innings so chasing can begin.
            </p>
            <Button
              type="button"
              size="sm"
              variant="default"
              disabled={updating || disabled}
              onClick={async () => {
                if (!matchId) return;
                setUpdating(true);
                try {
                  const res = await api.postJson(`/api/matches/${matchId}/cricket-start-innings`, {});
                  if (!res || typeof res !== 'object') {
                    throw new Error('Invalid response from server');
                  }
                  const data = (res as any).data;
                  if (!data || !data.sportScore) {
                    throw new Error('No cricket data in response');
                  }
                  const innings = data.sportScore.innings || [];
                  const currentInningsNum = data.sportScore.currentInningsNum || 2;
                  const selectedInnings = innings.find((i: any) => i.inningsNum === currentInningsNum);
                  if (!selectedInnings) {
                    throw new Error('Second innings not found in response');
                  }
                  setMatchInnings(innings);
                  setCricketInnings({
                    runs: selectedInnings.runs || 0,
                    wickets: selectedInnings.wickets || 0,
                    balls: selectedInnings.balls || [],
                    totalOvers: selectedInnings.totalOvers || 20,
                    currentInningsNum: selectedInnings.inningsNum || 2,
                    target: selectedInnings.target || 0,
                  });
                  onInningsUpdated?.();
                } catch (err: any) {
                  let errorMessage = 'Unknown error';
                  if (err && typeof err === 'object') {
                    if (err.message) {
                      errorMessage = err.message;
                    } else if (err.success === false && err.message) {
                      errorMessage = err.message;
                    }
                  } else if (typeof err === 'string') {
                    errorMessage = err;
                  }
                  console.error('Failed to start second innings:', errorMessage);
                  alert(`Second Innings Error: ${errorMessage}\n\nSteps to fix:\n1. Make sure all overs are played OR all 10 wickets are down\n2. Click "Update Score" button to save the first innings as Finished\n3. Then try "Start Second Innings" again`);
                } finally {
                  setUpdating(false);
                }
              }}
              className="mt-3"
            >
              Start Second Innings
            </Button>
          </div>
        )}

        {/* UNDO BUTTON */}
        {cricketInnings.balls.length > 0 && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={updating || disabled}
            onClick={handleUndo}
            className="w-full"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Undo Last Ball
          </Button>
        )}

        {/* STATUS */}
        {isInningsComplete && (
          <div className="p-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg">
            <p className="text-sm font-semibold text-amber-900 dark:text-amber-200">
              ✓ Innings Complete
            </p>
            <p className="text-[11px] text-amber-700 dark:text-amber-300 mt-1">
              {cricketInnings.wickets >= 10
                ? `All out: ${cricketInnings.runs}/${cricketInnings.wickets} (${currentOvers})`
                : `Overs complete: ${cricketInnings.runs}/${cricketInnings.wickets} (${currentOvers})`}
          {cricketInnings.currentInningsNum === 2 && cricketInnings.target > 0 && (
            <p className="text-[11px] text-muted-foreground mt-1">
              Target: {cricketInnings.target}
            </p>
          )}
            </p>
          </div>
        )}

        {/* STATUS TOGGLE */}
        <div className="space-y-2">
          <Label className="text-xs">Match status</Label>
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              size="sm"
              variant={status === 'live' ? 'default' : 'outline'}
              className={cn(status === 'live' && 'bg-red-600 hover:bg-red-700')}
              disabled={disabled}
              onClick={() => setStatus('live')}
            >
              Live
            </Button>
            <Button
              type="button"
              size="sm"
              variant={status === 'completed' ? 'default' : 'outline'}
              disabled={disabled}
              onClick={() => setStatus('completed')}
            >
              Finished
            </Button>
          </div>
        </div>

        {/* SAVE BUTTON FOR CRICKET */}
        <Button
          type="button"
          className="w-full hover:opacity-90 text-white"
          style={{ backgroundColor: 'var(--sport-primary)' }}
          disabled={disabled || updating}
          onClick={handleCricketSave}
        >
          {updating ? (
            <span className="inline-flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              Saving…
            </span>
          ) : isInningsComplete && status === 'completed' ? (
            '✓ Score Saved'
          ) : (
            'Update Score'
          )}
        </Button>
      </div>
    );
  }

  if (isShuttle) {
    const currentSetKey = `set${currentShuttleSet}` as keyof typeof shuttleSetScores;
    const currentSetScore = shuttleSetScores[currentSetKey];
    const isCurrentSetWon = currentSetScore.playerA === 21 || currentSetScore.playerB === 21;

    return (
      <div className="rounded-xl border border-border bg-card p-4 space-y-4">
        <div>
          <p className="text-xs font-semibold" style={{ color: 'var(--sport-primary)' }}>
            Shuttle — Real-Time Point Scoring
          </p>
          <p className="text-[11px] text-muted-foreground mt-0.5">
            {teamALabel} vs {teamBLabel}
          </p>
        </div>

        {/* SET SELECTION BUTTONS */}
        <div className="space-y-2">
          <p className="text-[10px] font-semibold text-muted-foreground uppercase">Select Set</p>
          <div className="flex gap-2">
            {(['A', 'B', 'C'] as const).map((set) => (
              <Button
                key={set}
                type="button"
                size="sm"
                variant={currentShuttleSet === set ? 'default' : 'outline'}
                className={cn(
                  currentShuttleSet === set && 'bg-blue-600 hover:bg-blue-700',
                  completedShuttleSets.has(set) && 'ring-2 ring-emerald-500'
                )}
                disabled={disabled}
                onClick={() => handleShuttleSwitchSet(set)}
              >
                Set {set}
                {completedShuttleSets.has(set) && ' ✓'}
              </Button>
            ))}
          </div>
        </div>

        {/* CURRENT SET SCORE DISPLAY */}
        <div className="p-4 rounded-lg border-2 border-blue-300 dark:border-blue-700 bg-blue-50 dark:bg-blue-950/30">
          <p className="text-sm font-semibold text-blue-900 dark:text-blue-200 mb-3 text-center">
            Set {currentShuttleSet}
          </p>
          <div className="grid grid-cols-2 gap-3">
            <div className="text-center">
              <p className="text-[11px] text-blue-600 dark:text-blue-400 font-semibold mb-1">
                {teamALabel}
              </p>
              <p className="text-4xl font-bold text-blue-700 dark:text-blue-300">
                {currentSetScore.playerA}
              </p>
            </div>
            <div className="text-center">
              <p className="text-[11px] text-blue-600 dark:text-blue-400 font-semibold mb-1">
                {teamBLabel}
              </p>
              <p className="text-4xl font-bold text-blue-700 dark:text-blue-300">
                {currentSetScore.playerB}
              </p>
            </div>
          </div>
        </div>

        {/* SET SUMMARY */}
        <div className="grid grid-cols-3 gap-2 p-3 bg-muted/30 rounded-lg border border-border/50">
          {(['A', 'B', 'C'] as const).map((set) => {
            const setKey = `set${set}` as keyof typeof shuttleSetScores;
            const score = shuttleSetScores[setKey];
            return (
              <div key={set} className="text-center text-[10px]">
                <p className="font-semibold text-muted-foreground mb-1">Set {set}</p>
                <p className={cn(
                  'font-bold',
                  completedShuttleSets.has(set) ? 'text-emerald-600 dark:text-emerald-400' : 'text-foreground'
                )}>
                  {score.playerA}-{score.playerB}
                </p>
              </div>
            );
          })}
        </div>

        {/* POINT BUTTONS */}
        {!isCurrentSetWon && (
          <div className="space-y-3 p-3 bg-muted/30 rounded-lg border border-border/50">
            <p className="text-[10px] font-semibold text-muted-foreground uppercase">
              🏸 Add Point (click to increment)
            </p>
            <div className="grid grid-cols-2 gap-3">
              <Button
                type="button"
                size="lg"
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-lg h-20"
                disabled={updating || disabled}
                onClick={() => handleShuttlePoint('A')}
              >
                +A
                <br />
                <span className="text-xs">{teamALabel}</span>
              </Button>
              <Button
                type="button"
                size="lg"
                className="bg-purple-600 hover:bg-purple-700 text-white font-bold text-lg h-20"
                disabled={updating || disabled}
                onClick={() => handleShuttlePoint('B')}
              >
                +B
                <br />
                <span className="text-xs">{teamBLabel}</span>
              </Button>
            </div>
          </div>
        )}

        {/* SET WON MESSAGE */}
        {isCurrentSetWon && (
          <div className="p-3 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800 rounded-lg">
            <p className="text-sm font-semibold text-emerald-900 dark:text-emerald-200">
              ✓ Set {currentShuttleSet} Complete
            </p>
            <p className="text-[11px] text-emerald-700 dark:text-emerald-300 mt-1">
              {currentSetScore.playerA === 21 ? teamALabel : teamBLabel} wins {currentSetScore.playerA}-{currentSetScore.playerB}
            </p>
          </div>
        )}

        {/* UNDO BUTTON */}
        {(currentSetScore.playerA > 0 || currentSetScore.playerB > 0) && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={updating || disabled}
            onClick={handleShuttleUndo}
            className="w-full"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Undo Last Point
          </Button>
        )}

        {/* STATUS TOGGLE */}
        <div className="space-y-2">
          <Label className="text-xs">Match status</Label>
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              size="sm"
              variant={status === 'live' ? 'default' : 'outline'}
              className={cn(status === 'live' && 'bg-red-600 hover:bg-red-700')}
              disabled={disabled}
              onClick={() => setStatus('live')}
            >
              Live
            </Button>
            <Button
              type="button"
              size="sm"
              variant={status === 'completed' ? 'default' : 'outline'}
              disabled={disabled}
              onClick={() => setStatus('completed')}
            >
              Finished
            </Button>
          </div>
        </div>

        {/* SAVE BUTTON FOR SHUTTLE */}
        <Button
          type="button"
          className="w-full hover:opacity-90 text-white"
          style={{ backgroundColor: 'var(--sport-primary)' }}
          disabled={disabled || updating}
          onClick={handleShuttleSave}
        >
          {updating ? (
            <span className="inline-flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              Saving…
            </span>
          ) : (
            'Update Score'
          )}
        </Button>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border bg-card p-4 space-y-4">
      <div>
        <p className="text-xs font-semibold" style={{ color: 'var(--sport-primary)' }}>
          {config.label}
        </p>
        <p className="text-[11px] text-muted-foreground mt-0.5">
          {teamALabel} vs {teamBLabel}
        </p>
      </div>

      <div className="space-y-3">
        {config.fields.map((field) => {
          if (field.type === 'setPairs') {
            return (
              <div key={field.id} className="space-y-2">
                <Label className="text-xs">{field.label}</Label>
                <p className="text-[10px] text-muted-foreground">
                  One box per set (e.g. 6-4 or 21-19). Leave unused rows empty.
                </p>
                <div className="grid gap-2 sm:grid-cols-2">
                  {setPairs.map((val, i) => (
                    <Input
                      key={i}
                      placeholder={`Set ${i + 1} (A-B)`}
                      value={val}
                      disabled={disabled}
                      className="font-mono text-sm"
                      onChange={(e) => {
                        const next = [...setPairs];
                        next[i] = e.target.value;
                        setSetPairs(next);
                      }}
                    />
                  ))}
                </div>
              </div>
            );
          }
          return (
            <div key={field.id} className="space-y-1">
              <Label htmlFor={field.id} className="text-xs">
                {field.label}
              </Label>
              <Input
                id={field.id}
                type={field.type === 'number' ? 'number' : 'text'}
                min={field.type === 'number' ? 0 : undefined}
                placeholder={field.placeholder}
                value={values[field.id] ?? ''}
                disabled={disabled}
                className="text-sm"
                onChange={(e) => setValues((v) => ({ ...v, [field.id]: e.target.value }))}
              />
            </div>
          );
        })}
      </div>

      <div className="space-y-2">
        <Label className="text-xs">Match status</Label>
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            size="sm"
            variant={status === 'live' ? 'default' : 'outline'}
            className={cn(status === 'live' && 'bg-red-600 hover:bg-red-700')}
            disabled={disabled}
            onClick={() => setStatus('live')}
          >
            Live
          </Button>
          <Button
            type="button"
            size="sm"
            variant={status === 'completed' ? 'default' : 'outline'}
            disabled={disabled}
            onClick={() => setStatus('completed')}
          >
            Finished
          </Button>
        </div>
      </div>

      <Button
        type="button"
        className="w-full hover:opacity-90 text-white"
        style={{ backgroundColor: 'var(--sport-primary)' }}
        disabled={disabled}
        onClick={() => onReview?.(buildDraft())}
      >
        {disabled ? (
          <span className="inline-flex items-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin" />
            Working…
          </span>
        ) : (
          'Update Score'
        )}
      </Button>
    </div>
  );
}
