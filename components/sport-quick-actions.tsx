'use client';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { getQuickActionsBySport, type QuickAction } from '@/lib/sport-specific-actions';

interface SportQuickActionsProps {
  sportSlug: string;
  onAction: (actionId: string) => void;
  disabled?: boolean;
  className?: string;
}

export function SportQuickActions({ sportSlug, onAction, disabled = false, className }: SportQuickActionsProps) {
  const actions = getQuickActionsBySport(sportSlug);

  if (!actions.length) return null;

  return (
    <div className={cn('flex flex-wrap gap-2', className)}>
      {actions.map((action) => (
        <Button
          key={action.id}
          type="button"
          variant="outline"
          size="sm"
          className={cn(
            'h-8 px-3 text-xs font-medium',
            action.color === 'emerald' && 'border-emerald-500/40 hover:bg-emerald-500/10 hover:text-emerald-600'
          )}
          disabled={disabled}
          onClick={() => onAction(action.id)}
          title={action.key ? `Press ${action.key}` : undefined}
        >
          {action.icon && <span className="mr-1">{action.icon}</span>}
          {action.label}
        </Button>
      ))}
    </div>
  );
}
