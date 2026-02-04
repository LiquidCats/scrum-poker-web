# Scrum Poker Backend

A real-time WebSocket-based backend for the Scrum Poker application, built with Go.

## Features

- 🔌 **WebSocket Support** - Real-time bidirectional communication
- 🏠 **Room Management** - Create, join, and manage poker rooms
- 🗳️ **Voting System** - Cast, reveal, and reset votes
- 📊 **Statistics** - Automatic calculation of average, median, mode
- 🔄 **Auto-cleanup** - Inactive rooms are automatically removed
- 🐳 **Docker Ready** - Easy containerized deployment
- ⚡ **High Performance** - Concurrent room handling with Go

## Tech Stack

- **Language**: Go 1.22+
- **Router**: Chi v5
- **WebSocket**: Gorilla WebSocket
- **UUID**: Google UUID

## Quick Start

### Prerequisites

- Go 1.22 or later
- (Optional) Docker & Docker Compose

### Run Locally

```bash
# Clone and navigate
cd scrum-poker-backend

# Download dependencies
go mod download

# Run server
go run ./cmd/server

# Or use Make
make run
```

Server starts at `http://localhost:8080`

### Run with Docker

```bash
# Build and run
docker-compose up -d

# Or build manually
docker build -t scrum-poker-backend .
docker run -p 8080:8080 scrum-poker-backend
```

## API Reference

### REST Endpoints

#### Health Check
```
GET /health
```
Returns server health and statistics.

#### Create Room
```
POST /api/rooms
Content-Type: application/json

{
  "name": "Sprint Planning",
  "hostName": "John Doe"
}
```
Response:
```json
{
  "room": { ... },
  "playerId": "uuid"
}
```

#### Check Room Exists
```
GET /api/rooms/{roomId}/check
```

#### Get Room
```
GET /api/rooms/{roomId}
```

#### Join Room
```
POST /api/rooms/{roomId}/join
Content-Type: application/json

{
  "playerName": "Jane Doe",
  "playerId": "optional-for-reconnection"
}
```

#### Get Valid Cards
```
GET /api/cards
```

#### Get Stats
```
GET /api/stats
```

### WebSocket API

Connect to WebSocket:
```
ws://localhost:8080/ws
```

#### Client → Server Messages

**Join Room**
```json
{
  "type": "join_room",
  "payload": {
    "roomId": "ABC123",
    "playerName": "John Doe",
    "playerId": "optional-uuid"
  }
}
```

**Cast Vote**
```json
{
  "type": "cast_vote",
  "payload": {
    "vote": "5"
  }
}
```

**Clear Vote**
```json
{
  "type": "clear_vote"
}
```

**Reveal Votes** (host only)
```json
{
  "type": "reveal_votes"
}
```

**Reset Round** (host only)
```json
{
  "type": "reset_round"
}
```

**Set Issue** (host only)
```json
{
  "type": "set_issue",
  "payload": {
    "issue": "JIRA-123: Implement login feature"
  }
}
```

**Update Settings** (host only)
```json
{
  "type": "update_settings",
  "payload": {
    "settings": {
      "allowSpectators": true,
      "autoReveal": false,
      "showAverage": true,
      "timer": null
    }
  }
}
```

**Ping**
```json
{
  "type": "ping"
}
```

#### Server → Client Messages

**Connected**
```json
{
  "type": "connected",
  "payload": {
    "playerId": "uuid",
    "roomId": "ABC123"
  }
}
```

**Room State**
```json
{
  "type": "room_state",
  "payload": {
    "id": "ABC123",
    "name": "Sprint Planning",
    "hostId": "uuid",
    "players": [...],
    "currentIssue": "...",
    "status": "waiting|voting|revealed",
    "deck": ["0", "½", "1", ...],
    "settings": {...},
    "votedCount": 3,
    "playerCount": 5
  }
}
```

**Player Joined**
```json
{
  "type": "player_joined",
  "payload": {
    "player": {
      "id": "uuid",
      "name": "John",
      "isHost": false,
      "hasVoted": false,
      "isOnline": true
    }
  }
}
```

**Vote Cast**
```json
{
  "type": "vote_cast",
  "payload": {
    "playerId": "uuid",
    "hasVoted": true,
    "votedCount": 3,
    "totalCount": 5
  }
}
```

**Votes Revealed**
```json
{
  "type": "votes_revealed",
  "payload": {
    "players": [...],
    "results": {
      "average": 5.5,
      "median": 5,
      "mode": "5",
      "consensus": false,
      "distribution": {"3": 1, "5": 2, "8": 1},
      "totalVotes": 4,
      "validVotes": 4
    }
  }
}
```

**Round Reset**
```json
{
  "type": "round_reset",
  "payload": { /* room state */ }
}
```

**Error**
```json
{
  "type": "error",
  "payload": {
    "code": "error_code",
    "message": "Human readable message"
  }
}
```

## Project Structure

```
scrum-poker-backend/
├── cmd/
│   └── server/
│       └── main.go           # Entry point
├── internal/
│   ├── handlers/
│   │   └── handlers.go       # HTTP handlers
│   ├── models/
│   │   ├── models.go         # Domain models
│   │   └── messages.go       # WebSocket messages
│   ├── room/
│   │   └── manager.go        # Room lifecycle
│   └── websocket/
│       ├── client.go         # WS client
│       └── hub.go            # WS hub
├── Dockerfile
├── docker-compose.yml
├── Makefile
├── go.mod
└── README.md
```

## Configuration

Environment variables:

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `8080` | Server port |
| `ALLOWED_ORIGINS` | `*` | CORS allowed origins |

## Development

```bash
# Install air for hot reload
go install github.com/air-verse/air@latest

# Run with hot reload
make dev

# Run tests
make test

# Run linter
make lint

# Format code
make fmt
```

## Frontend Integration

Update the Nuxt frontend to connect to this backend:

```typescript
// composables/useWebSocket.ts
const WS_URL = 'ws://localhost:8080/ws'
const API_URL = 'http://localhost:8080/api'

export function useWebSocket() {
  const socket = ref<WebSocket | null>(null)
  
  const connect = () => {
    socket.value = new WebSocket(WS_URL)
    
    socket.value.onmessage = (event) => {
      const message = JSON.parse(event.data)
      handleMessage(message)
    }
  }
  
  const send = (type: string, payload?: any) => {
    socket.value?.send(JSON.stringify({ type, payload }))
  }
  
  return { connect, send, socket }
}
```

## License

MIT License
