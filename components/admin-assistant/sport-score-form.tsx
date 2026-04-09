'use client';

import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { getScoreConfigBySport, type SportScoreDraft } from '@/lib/sport-scoring';
import { Loader2 } from 'lucide-react';

interface SportScoreFormProps {
  sportSlug: string;
  teamALabel: string;
  teamBLabel: string;
  disabled?: boolean;
  onReview: (draft: SportScoreDraft) => void;
}

export function AssistantSportScoreForm({
  sportSlug,
  teamALabel,
  teamBLabel,
  disabled,
  onReview,
}: SportScoreFormProps) {
  const config = useMemo(() => getScoreConfigBySport(sportSlug), [sportSlug]);
  const setRows = config.defaultSetRows ?? 3;

  const [values, setValues] = useState<Record<string, string>>({});
  const [setPairs, setSetPairs] = useState<string[]>(() => Array.from({ length: setRows }, () => ''));
  const [status, setStatus] = useState<'live' | 'completed'>('live');

  const hasSetPairs = config.fields.some((f) => f.type === 'setPairs');

  const buildDraft = (): SportScoreDraft => {
    const draft: SportScoreDraft = { ...values, status };
    if (hasSetPairs) {
      draft.setPairs = setPairs.map((s) => s.trim()).filter(Boolean);
    }
    return draft;
  };

  const handleReview = () => {
    onReview(buildDraft());
  };

  return (
    <div className="rounded-xl border border-border bg-card p-4 space-y-4">
      <div>
        <p className="text-xs font-semibold text-[var(--sport-primary)]">{config.label}</p>
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
                <p className="text-[10px] text-muted-foreground">One box per set (e.g. 6-4 or 21-19). Leave unused rows empty.</p>
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
        className="w-full bg-[var(--sport-primary)] hover:opacity-90 text-white"
        disabled={disabled}
        onClick={handleReview}
      >
        {disabled ? (
          <span className="inline-flex items-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin" />
            Working…
          </span>
        ) : (
          'Review update'
        )}
      </Button>
    </div>
  );
}
