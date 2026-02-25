'use client';

import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

interface AdminPageHeaderProps {
  icon: string;
  title: string;
  description: string;
  buttonLabel?: string;
  onButtonClick?: () => void;
}

export function AdminPageHeader({
  icon,
  title,
  description,
  buttonLabel,
  onButtonClick,
}: AdminPageHeaderProps) {
  return (
    <div className="bg-card border-b border-border sticky top-0 z-10 px-8 py-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <span className="text-3xl">{icon}</span>
          <div>
            <h1 className="text-3xl font-bold">{title}</h1>
            <p className="text-muted-foreground">{description}</p>
          </div>
        </div>
        {buttonLabel && (
          <Button
            onClick={onButtonClick}
            className="bg-blue-500 hover:bg-blue-600 text-white dark:bg-blue-500 dark:hover:bg-blue-400 dark:text-white flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            {buttonLabel}
          </Button>
        )}
      </div>
    </div>
  );
}
