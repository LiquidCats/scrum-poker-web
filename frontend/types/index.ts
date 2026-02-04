// Card value types
export type CardValue = '0' | '½' | '1' | '2' | '3' | '5' | '8' | '13' | '21' | '34' | '55' | '89' | '?' | '☕'

export interface Card {
  value: CardValue
  label: string
  numericValue: number | null
}

// Player types
export interface Player {
  id: string
  name: string
  avatarColor?: string
  isHost: boolean
  vote: CardValue | null
  hasVoted: boolean
  isOnline: boolean
}

// Room types
export type RoomStatus = 'waiting' | 'voting' | 'revealed'

export interface Room {
  id: string
  name: string
  host: string
  players: Player[]
  currentIssue: string | null
  status: RoomStatus
  deck: CardValue[]
  createdAt: Date
  settings: RoomSettings
}

export interface RoomSettings {
  allowSpectators: boolean
  autoReveal: boolean
  showAverage: boolean
  timer: number | null // seconds, null means no timer
}

// Voting results
export interface VotingResult {
  average: number | null
  median: number | null
  mode: CardValue | null
  consensus: boolean
  distribution: Record<CardValue, number>
  totalVotes: number
  validVotes: number
}

// Event types for real-time communication
export type RoomEvent = 
  | { type: 'player_joined'; player: Player }
  | { type: 'player_left'; playerId: string }
  | { type: 'vote_cast'; playerId: string }
  | { type: 'votes_revealed'; results: VotingResult }
  | { type: 'round_reset' }
  | { type: 'issue_changed'; issue: string }
  | { type: 'settings_changed'; settings: RoomSettings }

// WebSocket message types
export type MessageType =
  // Client -> Server
  | 'join_room'
  | 'leave_room'
  | 'cast_vote'
  | 'clear_vote'
  | 'reveal_votes'
  | 'reset_round'
  | 'set_issue'
  | 'update_settings'
  | 'ping'
  // Server -> Client
  | 'room_state'
  | 'player_joined'
  | 'player_left'
  | 'vote_cast'
  | 'vote_cleared'
  | 'votes_revealed'
  | 'round_reset'
  | 'issue_changed'
  | 'settings_changed'
  | 'error'
  | 'pong'
  | 'connected'

export interface WSMessage {
  type: MessageType
  payload?: any
}

// User preferences
export interface UserPreferences {
  name: string
  avatarColor: string
  defaultDeck: CardValue[]
  soundEnabled: boolean
}
