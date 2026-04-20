'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Badge } from '@/components/ui/badge';
import { Check } from 'lucide-react';
import { usePlayers, type PlayerData } from '@/hooks/use-players';

interface PlayerSelector Props {
  sportId: string;
  teamId?: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (player: PlayerData) => void;
  title?: string;
  description?: string;
}

/**
 * Player Selector Component
 * Modal dialog to select a player from a team for event tracking
 * Used during live matches to attribute scoring to specific players
 */
export function PlayerSelector({
  sportId,
  teamId,
  open,
  onOpenChange,
  onSelect,
  title = 'Select Player',
  description = 'Choose a player to attribute this action',
}: PlayerSelector) {
  const { players, isLoading } = usePlayers(sportId, teamId);
  const [search, setSearch] = useState('');

  const filteredPlayers = players.filter(
    (p) => p.name.toLowerCase().includes(search.toLowerCase()) || String(p.number || '').includes(search)
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>

        <Command className="rounded-lg border border-input">
          <CommandInput placeholder="Search by name or number..." value={search} onValueChange={setSearch} />
          <CommandList className="max-h-64">
            <CommandEmpty>
              {isLoading ? 'Loading players...' : 'No players found in this team.'}
            </CommandEmpty>
            <CommandGroup>
              {filteredPlayers.map((player) => (
                <CommandItem
                  key={player._id}
                  value={player._id}
                  onSelect={() => {
                    onSelect(player);
                    onOpenChange(false);
                  }}
                  className="cursor-pointer"
                >
                  <div className="flex items-center justify-between flex-1">
                    <div className="flex items-center gap-2">
                      {player.number && (
                        <Badge variant="outline" className="text-xs">
                          #{player.number}
                        </Badge>
                      )}
                      <span className="font-medium">{player.name}</span>
                      {player.role && (
                        <span className="text-xs text-muted-foreground">({player.role})</span>
                      )}
                    </div>
                    <Check className="w-4 h-4 opacity-0 group-data-[selected=true]:opacity-100" />
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </DialogContent>
    </Dialog>
  );
}
