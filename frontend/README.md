# Scrum Poker

A real-time planning poker application built with Nuxt 3 for agile teams.

![Scrum Poker](./docs/preview.png)

## Features

- 🎴 **Interactive Card Selection** - Fibonacci-based deck with animated card selection
- 👥 **Real-time Collaboration** - See who's voted and reveal cards together
- 📊 **Voting Statistics** - Average, median, mode, and vote distribution
- 🎯 **Consensus Detection** - Visual indicator when team reaches agreement
- 🎨 **Beautiful UI** - Poker table aesthetic with smooth animations
- 📱 **Responsive Design** - Works on desktop and mobile devices

## Tech Stack

- **Framework**: [Nuxt 3](https://nuxt.com)
- **Styling**: [Tailwind CSS](https://tailwindcss.com)
- **State**: Vue 3 Composables
- **Fonts**: Space Mono, Outfit (via Google Fonts)
- **TypeScript**: Full type safety

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn or pnpm

### Installation

```bash
# Clone the repository
git clone <your-repo-url>
cd scrum-poker

# Install dependencies
npm install

# Start development server
npm run dev
```

The app will be available at `http://localhost:3000`

### Build for Production

```bash
# Build the application
npm run build

# Preview production build
npm run preview
```

## Project Structure

```
scrum-poker/
├── assets/
│   └── css/
│       └── main.css          # Global styles & Tailwind config
├── components/
│   ├── HostControls.vue      # Room controls for hosts
│   ├── PlayerAvatar.vue      # Player avatar with voting status
│   ├── PlayersTable.vue      # Grid of all players
│   ├── PokerCard.vue         # Interactive poker card
│   ├── ResultsPanel.vue      # Voting results & statistics
│   └── VotingPanel.vue       # Card selection deck
├── composables/
│   ├── usePokerDeck.ts       # Deck definitions & utilities
│   └── useRoom.ts            # Room state management
├── layouts/
│   └── default.vue           # App layout with header/footer
├── pages/
│   ├── index.vue             # Home page (create/join)
│   └── room/
│       └── [id].vue          # Room page
├── types/
│   └── index.ts              # TypeScript definitions
├── public/
│   └── favicon.svg           # App icon
├── nuxt.config.ts            # Nuxt configuration
├── tailwind.config.ts        # Tailwind customization
└── package.json
```

## Customization

### Card Deck

Edit `composables/usePokerDeck.ts` to customize the available cards:

```typescript
export const CUSTOM_DECK: Card[] = [
  { value: '1', label: '1', numericValue: 1 },
  { value: '2', label: '2', numericValue: 2 },
  // Add your custom cards...
]
```

### Theme Colors

Modify `tailwind.config.ts` to change the color scheme:

```typescript
colors: {
  'poker': {
    'felt': '#0d1f12',        // Background color
    'gold': '#d4af37',        // Primary accent
    'accent': '#ff6b35',      // Secondary accent
    // ...
  }
}
```

## Adding Real-time Backend

This template uses local state for demonstration. To add real-time functionality:

1. **WebSocket Server** (recommended: Socket.io, Ably, or Pusher)
2. **Database** (optional: store room history)

Example integration points in `composables/useRoom.ts`:

```typescript
// Connect to WebSocket on room join
function joinRoom(roomId: string, playerName: string) {
  socket.emit('join-room', { roomId, playerName })
  // Listen for room events...
}

// Broadcast votes
function castVote(value: CardValue) {
  socket.emit('cast-vote', { value })
}
```

## License

MIT License - feel free to use this template for your projects!

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
