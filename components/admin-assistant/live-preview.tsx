'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { FlowContext } from '@/hooks/use-admin-assistant';
import { Eye } from 'lucide-react';

function row(label: string, value: string | number | undefined | null) {
  if (value === undefined || value === null || value === '') return null;
  return (
    <div className="flex justify-between gap-2 text-xs py-1 border-b border-border/60 last:border-0">
      <span className="text-muted-foreground shrink-0">{label}</span>
      <span className="font-medium text-right truncate">{String(value)}</span>
    </div>
  );
}

export function AssistantLivePreview({
  flow,
  sportSlug,
}: {
  flow: FlowContext | null;
  sportSlug: string;
}) {
  return (
    <Card className="bg-card border-border h-full shadow-sm">
      <CardHeader className="py-3 px-4 border-b border-border">
        <CardTitle className="text-sm font-semibold flex items-center gap-2">
          <Eye className="w-4 h-4 text-[var(--sport-primary)]" />
          Live preview
        </CardTitle>
        <p className="text-[11px] text-muted-foreground font-normal">
          Draft data before you confirm — nothing saves until you confirm in chat.
        </p>
      </CardHeader>
      <CardContent className="px-4 py-3 text-sm">
        {!flow && (
          <p className="text-xs text-muted-foreground">Start a flow to see fields fill in here.</p>
        )}
        {flow && (
          <div className="space-y-2">
            <p className="text-[10px] uppercase tracking-wide text-muted-foreground font-semibold">
              {flow.action.replace(/_/g, ' ')} · step {flow.step}
            </p>
            <div className="rounded-lg bg-muted/30 border border-border/80 p-2">
              {row('Sport', sportSlug)}
              {flow.action === 'update_score' && (
                <>
                  {row('Match', flow.data.matchId ? `${flow.data.teamALabel} vs ${flow.data.teamBLabel}` : '—')}
                  {flow.data.scorePreviewText
                    ? row('Preview', String(flow.data.scorePreviewText).replace(/\n/g, ' · '))
                    : null}
                  {row('Score A (list)', flow.data.scorePayload ? (flow.data.scorePayload as { scoreA?: number }).scoreA : undefined)}
                  {row('Score B (list)', flow.data.scorePayload ? (flow.data.scorePayload as { scoreB?: number }).scoreB : undefined)}
                  {flow.step >= 3
                    ? row(
                        'Status',
                        (flow.data.scorePayload as { status?: string } | undefined)?.status === 'live'
                          ? 'Live'
                          : (flow.data.scorePayload as { status?: string } | undefined)?.status === 'completed'
                            ? 'Finished'
                            : undefined
                      )
                    : null}
                </>
              )}
              {flow.action === 'create_match' && (
                <>
                  {row('Team A', (flow.data.teamAName as string) || (flow.data.teamAResolved as string))}
                  {row('Team B', (flow.data.teamBName as string) || (flow.data.teamBResolved as string))}
                  {row('Date', flow.data.date as string | undefined)}
                  {row('IDs', flow.data.teamAId && flow.data.teamBId ? 'Teams resolved ✓' : undefined)}
                </>
              )}
              {flow.action === 'manage_teams' && (
                <>
                  {row('Team name', flow.data.name as string | undefined)}
                  {row('Players', flow.data.players as number | undefined)}
                </>
              )}
              {flow.action === 'add_highlights' && (
                <>
                  {row('Title', flow.data.title as string | undefined)}
                  {row('Match link', flow.data.matchId ? 'Yes' : flow.step > 2 ? 'No (sport-wide)' : '—')}
                  {row('Video', flow.step >= 4 ? 'File or URL set' : flow.step === 3 ? 'Waiting for upload' : '—')}
                  {row('Description', (flow.data.description as string) || undefined)}
                </>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
