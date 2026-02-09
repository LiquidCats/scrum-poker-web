# Scrum Poker

A real-time planning poker application for agile teams. Built with a Go backend and Nuxt 3 frontend, communicating over WebSocket for instant updates.

## Tech Stack

### Backend
- **Go 1.25** with FastHTTP
- **Gorilla WebSocket** (fasthttp adapter)
- **Google UUID** for identifier generation

### Frontend
- **Nuxt 3** (Vue 3)
- **Tailwind CSS**
- **VueUse**
- **TypeScript**

## Quick Start

### Prerequisites

- Docker & Docker Compose

### Run with Docker Compose

```bash
docker-compose up -d
```

- Frontend: `http://localhost:3000`
- Backend: `http://localhost:8080`

### Run Locally

**Backend:**
```bash
go mod download
go run ./cmd/server
```

**Frontend:**
```bash
cd frontend
npm ci
npm run dev
```

## Project Structure

```
scrum-poker-web/
├── cmd/server/                  # Backend entry point
├── internal/
│   ├── handlers/                # HTTP & WebSocket handlers
│   ├── models/                  # Domain models & message types
│   ├── room/                    # Room lifecycle management
│   └── websocket/               # WebSocket client & hub
├── frontend/
│   ├── pages/                   # Nuxt pages (home, room/[id])
│   ├── components/              # Vue components
│   ├── composables/             # useRoom, usePokerDeck
│   ├── types/                   # TypeScript definitions
│   └── Dockerfile
├── .github/workflows/           # CI/CD pipelines
├── Dockerfile                   # Backend container
├── docker-compose.yml
└── Makefile
```

## Features

- **Real-time voting** over WebSocket with instant state sync
- **Room management** with 6-character invite codes
- **Fibonacci deck** (0, 1/2, 1, 2, 3, 5, 8, 13, 21, 34, 55, 89, ?, coffee)
- **Vote statistics** — average, median, mode, consensus detection
- **Host controls** — reveal votes, reset round, set current issue, configure settings
- **Auto-reveal** — optional automatic reveal when all players vote
- **Session persistence** — players can rejoin after page refresh
- **Auto-cleanup** — inactive rooms are removed after 2 hours

## API

### REST Endpoints

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/api/rooms` | Create a room |
| `GET` | `/api/rooms/{roomId}` | Get room state |
| `GET` | `/api/rooms/{roomId}/check` | Check if room exists |
| `POST` | `/api/rooms/{roomId}/join` | Join a room |
| `GET` | `/api/cards` | Get valid card values |
| `GET` | `/api/stats` | Server statistics |
| `GET` | `/health` | Health check |

### WebSocket

Connect at `ws://localhost:8080/ws`.

**Client messages:** `join_room`, `cast_vote`, `clear_vote`, `reveal_votes`, `reset_round`, `set_issue`, `update_settings`, `ping`

**Server messages:** `connected`, `room_state`, `player_joined`, `vote_cast`, `votes_revealed`, `round_reset`, `error`, `pong`

## Configuration

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `8080` | Backend server port |
| `ALLOWED_ORIGINS` | `*` | CORS allowed origins |
| `NUXT_PUBLIC_API_BASE` | — | Backend URL for frontend |

## Development

```bash
# Run backend tests
make test

# Lint backend
make lint

# Auto-fix lint issues
make lint-fix

# Generate mocks
make mock
```

Frontend commands:
```bash
cd frontend
npm run dev          # Dev server
npm run build        # Production build
npm run lint         # ESLint
npm run typecheck    # Type checking
```

## CI/CD

GitHub Actions workflows:

- **build.yml** — orchestrates backend and frontend builds on push to `main`
- **backend-build.yml** — builds and pushes backend Docker image to GHCR (multi-arch)
- **frontend-build.yml** — builds and pushes frontend Docker image to GHCR (multi-arch)
- **go-tests.yml** — runs Go test suite
- **go-code-style.yml** — runs linter checks

## License

AGPL-3.0
