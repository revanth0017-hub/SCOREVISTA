# ScoreVista 2.0 - Event-Based Scoring API Documentation

## Overview
ScoreVista now supports fully event-based, real-time scoring for all sports with player-level stat tracking, sport-specific scoring logic, and live socket.io updates.

## New Endpoints

### Generic Event Processing
```
POST /api/matches/:id/event
```
Process a single event for any sport

**Request Body:**
```json
{
  "sportSlug": "cricket|football|basketball|tennis|volleyball|kabaddi|shuttle",
  "eventType": "goal|goal|1point|point|ace|raid|etc",
  "playerIds": ["playerId1", "playerId2"],
  "data": {
    "team": "A|B",
    "runs": 4,
    "value": 2
  }
}
```

**Response:** Updated match document with sportScore

---

## Sport-Specific Events

### Cricket
Events: `runs`, `wicket`, `wide`, `noBall`, `bye`, `legBye`

**Example:**
```json
{
  "sportSlug": "cricket",
  "eventType": "runs",
  "playerIds": ["batsmanId", "bowlerId"],
  "data": { "team": "A", "runs": 4 }
}
```

**sportScore Structure:**
```json
{
  "sportSlug": "cricket",
  "currentInningsNum": 1,
  "innings": [
    {
      "inningsNum": 1,
      "battingTeamId": "teamId",
      "bowlingTeamId": "teamId",
      "runs": 145,
      "wickets": 3,
      "overs": "20.0",
      "balls": [
        {
          "event": "runs-4",
          "runsScored": 4,
          "isWicket": false,
          "isExtra": false,
          "timestamp": "2026-04-16T..."
        }
      ],
      "status": "live|completed"
    }
  ],
  "events": []
}
```

---

### Football
Events: `goal`, `assist`, `yellow`, `red`, `shot`, `period-end`

**Example:**
```json
{
  "sportSlug": "football",
  "eventType": "goal",
  "playerIds": ["strikeId"],
  "data": { "team": "A" }
}
```

**sportScore Structure:**
```json
{
  "sportSlug": "football",
  "football": {
    "teamA": { "goals": 2, "possession": 0, "shots": 5, "yellows": 1, "reds": 0 },
    "teamB": { "goals": 1, "possession": 0, "shots": 3, "yellows": 0, "reds": 0 },
    "period": 2
  },
  "events": []
}
```

---

### Basketball
Events: `1point`, `2point`, `3point`, `foul`, `quarter-end`

**Example:**
```json
{
  "sportSlug": "basketball",
  "eventType": "3point",
  "playerIds": ["shooterId"],
  "data": { "team": "B" }
}
```

**sportScore Structure:**
```json
{
  "sportSlug": "basketball",
  "basketball": {
    "teamA": { "points": 45, "quarter": 2, "fouls": 3 },
    "teamB": { "points": 52, "quarter": 2, "fouls": 2 }
  },
  "events": []
}
```

---

### Tennis
Events: `point`, `deuce`, `advantage`, `ace`

**Example:**
```json
{
  "sportSlug": "tennis",
  "eventType": "point",
  "playerIds": ["playerId"],
  "data": { "team": "A" }
}
```

**sportScore Structure:**
```json
{
  "sportSlug": "tennis",
  "tennis": {
    "teamA": { "sets": [6, 7], "games": [5], "currentPoints": 30 },
    "teamB": { "sets": [4, 6], "games": [3], "currentPoints": 15 },
    "currentSet": 3
  },
  "events": []
}
```

---

### Volleyball
Events: `point`, `ace`

**Example:**
```json
{
  "sportSlug": "volleyball",
  "eventType": "ace",
  "playerIds": ["serverId"],
  "data": { "team": "A" }
}
```

**sportScore Structure:**
```json
{
  "sportSlug": "volleyball",
  "volleyball": {
    "teamA": { "sets": [25, 18], "points": 12 },
    "teamB": { "sets": [20, 25], "points": 15 }
  },
  "events": []
}
```

---

### Kabaddi
Events: `point`, `raid`, `tackle`

**Example:**
```json
{
  "sportSlug": "kabaddi",
  "eventType": "point",
  "playerIds": ["raiderId"],
  "data": { "team": "A", "value": 2 }
}
```

**sportScore Structure:**
```json
{
  "sportSlug": "kabaddi",
  "kabaddi": {
    "teamA": { "points": 28, "raids": 12, "tackles": 8 },
    "teamB": { "points": 24, "raids": 10, "tackles": 10 }
  },
  "events": []
}
```

---

### Shuttle/Badminton
Events: `point`, `ace`

**Example:**
```json
{
  "sportSlug": "shuttle",
  "eventType": "point",
  "playerIds": ["playerId"],
  "data": { "team": "B" }
}
```

**sportScore Structure:**
```json
{
  "sportSlug": "shuttle",
  "shuttle": {
    "teamA": { "sets": [21], "points": 15 },
    "teamB": { "sets": [19], "points": 18 }
  },
  "events": []
}
```

---

## Undo Event
```
POST /api/matches/:id/event-undo
```
Removes the last event and recalculates score

**Response:** Updated match document

---

## Get Player Stats
```
GET /api/matches/:id/player-stats
```
Fetches all players from both teams with their current stats

**Response:**
```json
{
  "success": true,
  "data": {
    "match": { "id": "matchId", "teamA": {...}, "teamB": {...} },
    "teamA": [
      {
        "_id": "playerId",
        "name": "Player Name",
        "number": 10,
        "role": "Bowler",
        "stats": {
          "runs": 0,
          "wickets": 2,
          "goals": 0,
          "assists": 0,
          "points": 0,
          "aces": 0,
          "fouls": 1,
          "sets": [],
          "games": []
        }
      }
    ],
    "teamB": [...]
  }
}
```

---

## Real-Time Socket.io Events

All events are emitted to connected clients:

- `scoreUpdated` - Full match update
- `eventUndone` - Event removal notification
- `sport:${sportId}` - Sport-specific room broadcasts

---

## Frontend Usage

### Using EventScoreForm Component

```tsx
import { EventScoreForm } from '@/components/event-score-form';

<EventScoreForm
  matchId="matchId"
  sportSlug="football"
  teamAPlayers={teamAPlayers}
  teamBPlayers={teamBPlayers}
  teamAName="Team A"
  teamBName="Team B"
  onEventProcessed={() => refetchMatch()}
/>
```

### Accessing Match Score Pages

Navigate to:
- `/admin/cricket/matches/[matchId]`
- `/admin/football/matches/[matchId]`
- `/admin/basketball/matches/[matchId]`
- `/admin/tennis/matches/[matchId]`
- `/admin/volleyball/matches/[matchId]`
- `/admin/kabaddi/matches/[matchId]`
- `/admin/shuttle/matches/[matchId]`

---

## Player Stats Auto-Tracking

When you record an event with playerIds, player stats are automatically updated:

| Event | Sport | Stat Update |
|-------|-------|------------|
| goal | Football | +1 goals |
| assist | Football | +1 assists |
| 1point | Basketball | +1 points |
| 2point | Basketball | +2 points |
| 3point | Basketball | +3 points |
| ace | Tennis/Volleyball/Shuttle | +1 aces |
| point | Any racket sport | +1 points |
| wicket | Cricket | +1 wickets |
| runs | Cricket | +N runs |
| raid | Kabaddi | +1 raids |
| tackle | Kabaddi | +1 tackles |

---

## Match Creation

Matches are automatically initialized with sportScore structure:

```
POST /api/matches
```

sportScore is initialized based on sport type, ready for event processing.

---

## Backward Compatibility

- Legacy cricket endpoints still work
- scoreA, scoreB updated automatically with each event
- Existing cricket ball-by-ball system preserved
