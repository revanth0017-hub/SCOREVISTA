# ScoreVista 2.0 - Setup & Implementation Guide

## What's New

ScoreVista has been completely refactored to support **real-time, event-based scoring for ALL sports** with automatic player stat tracking and live socket.io updates.

## Key Features

✅ **Universal Event Handler** - Single endpoint for all sports
✅ **Player-Level Stats** - Automatic stat tracking per player
✅ **Sport-Specific Logic** - Custom scoring rules per sport
✅ **Shortcut Buttons** - Quick event recording UI with sport shortcuts
✅ **Real-Time Updates** - Socket.io broadcasts to all connected clients
✅ **Undo Functionality** - Remove last event and recalculate score
✅ **Live Scoring Pages** - Dedicated pages for each sport at `/admin/[sport]/matches/[matchId]`

## System Architecture

```
Backend (Node.js/Express/MongoDB)
├── matchController
│   ├── processEvent() - Generic event handler
│   ├── sport-specific handlers (football, basketball, tennis, etc.)
│   ├── updatePlayerStats() - Auto stat tracking
│   ├── undoEvent() - Event removal
│   └── getMatchPlayerStats() - Player data fetch
├── routes/matches.js - New endpoints
└── models/Player.js - Player stat schema

Frontend (Next.js/React)
├── components/event-score-form.tsx - Universal event UI
├── components/admin-match-score-page.tsx - Match detail page
└── /admin/[sport]/matches/[matchId]/page.tsx - Sport pages
```

## How It Works

### 1. Recording an Event

When an admin records an event (e.g., "Goal" in football):

```
Admin clicks "⚽ Goal" button
  ↓
Selects player(s) involved
  ↓
Frontend sends POST /api/matches/:id/event
  {
    sportSlug: "football",
    eventType: "goal",
    playerIds: ["playerId"],
    data: { team: "A" }
  }
  ↓
Backend handler processes event:
  - Increments team score
  - Updates player stats (+1 goals)
  - Saves event to history
  ↓
Socket.io broadcasts update
  ↓
All clients see score update in real-time
```

### 2. Player Stat Tracking

Player stats are automatically tracked via the `Player` model:

```json
{
  "stats": {
    "runs": 145,
    "wickets": 3,
    "goals": 5,
    "assists": 2,
    "points": 28,
    "aces": 12,
    "fouls": 1,
    "sets": [6, 7],
    "games": [5, 3, 2]
  }
}
```

Each event type auto-maps to stat updates (see API_DOCUMENTATION.md for mapping table).

### 3. Match Score Pages

Each sport has a dedicated live scoring page:

**URL:** `/admin/cricket/matches/[matchId]`

**Features:**
- Live scoreboard
- Sport-specific event buttons with shortcuts
- Player selector (multi-select)
- Player stats display
- Undo functionality

### 4. Real-Time Updates

Socket.io emits updates to:
- All connected clients: `scoreUpdated`
- Sport-specific room: `sport:${sportId}` → `scoreUpdated`
- Undo broadcasts: `eventUndone`

## Usage Examples

### Recording a Cricket Wicket
1. Navigate to `/admin/cricket/matches/[matchId]`
2. Select batting team
3. Select batsman and bowler
4. Click "Wicket" button
5. Batsman wickets +1, player stats update
6. Score recalculated

### Recording a Tennis Point
1. Navigate to `/admin/tennis/matches/[matchId]`
2. Select player's team
3. Select player
4. Click "Point (0/15/30/40)" button
5. Score advances: 0 → 15 → 30 → 40 → game
6. Auto-handles deuces and advantages
7. Game win → set advancement

### Recording a Basketball 3-Pointer
1. Navigate to `/admin/basketball/matches/[matchId]`
2. Select team
3. Select shooter
4. Click "3 Points" button
5. Player points +3, team score +3
6. Stats updated

## Integration With Existing Code

**Backward Compatibility:**
- Old cricket endpoints still work
- scoreA/scoreB auto-updated
- Legacy cricket UI can coexist

**New Event Endpoint:**
```typescript
// Instead of this (cricket-specific):
POST /api/matches/:id/cricket-ball

// Use this (universal):
POST /api/matches/:id/event
```

## Adding Support for Individual Player Sports

For sports like Tennis, Badminton (individual players not teams):

The current system already handles individual player sports - assign both players to "different teams" or use special handling:

```json
{
  "teamA": { "name": "Player 1 / Team A", "playerList": [player1Id] },
  "teamB": { "name": "Player 2 / Team B", "playerList": [player2Id] }
}
```

Or create a bridge mode where individual sports store both players in separate team records.

## Database Migration

No migration needed! Existing matches are compatible:

1. Old cricket innings data remains intact
2. New sportScore structure is additive
3. scoreA/B fields continue working
4. Both old and new endpoints can coexist during transition

## Development Workflow

### To Add Event Recording for a Match:

1. Navigate to match in admin dashboard
2. Click "Score" (green Activity icon)
3. Select event type and players
4. Click event button
5. See real-time updates

### To Add New Sport:

1. Add event handler in matchController: `handleNewSportEvent()`
2. Add sportScore initialization in `create()`
3. Add recalculation function in `undoEvent()`
4. Create admin page: `/app/admin/newsport/matches/[matchId]/page.tsx`
5. Update EventScoreForm with sport-specific buttons

## Testing

### Test Event Recording:
```bash
curl -X POST http://localhost:3000/api/matches/[matchId]/event \
  -H "Content-Type: application/json" \
  -d '{
    "sportSlug": "football",
    "eventType": "goal",
    "playerIds": ["playerId"],
    "data": { "team": "A" }
  }'
```

### Test Undo:
```bash
curl -X POST http://localhost:3000/api/matches/[matchId]/event-undo
```

### Test Player Stats:
```bash
curl http://localhost:3000/api/matches/[matchId]/player-stats
```

## Performance Considerations

- Events stored in sportScore.events array (indexed)
- Player updates use MongoDB $inc (atomic)
- Socket.io rooms by sport for efficient broadcasting
- Scores recalculated only on undo (not on each event)

## Common Issues

**Issue:** Players not updating stats
**Solution:** Check playerIds format (must be valid MongoDB ObjectIds)

**Issue:** Sport-specific buttons not showing
**Solution:** Verify sportSlug matches backend sport type (lowercase)

**Issue:** Undo not working
**Solution:** Ensure sportScore has events array (auto-created on first event)

## Next Steps

1. Test each sport's event recording
2. Customize shortcuts per sport
3. Add print/export match scorecard
4. Add match analytics dashboard
5. Add fan-facing live score view
