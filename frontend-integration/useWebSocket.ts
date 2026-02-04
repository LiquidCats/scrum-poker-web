/**
 * WebSocket composable for connecting Nuxt frontend to Go backend
 * Add this file to: scrum-poker/composables/useWebSocket.ts
 */

import type { Room, Player, CardValue, VotingResult } from '~/types'

// Configuration
const WS_URL = process.env.NUXT_PUBLIC_WS_URL || 'ws://localhost:8080/ws'
const API_URL = process.env.NUXT_PUBLIC_API_URL || 'http://localhost:8080/api'

// Message types
type MessageType = 
  | 'join_room' | 'leave_room' | 'cast_vote' | 'clear_vote'
  | 'reveal_votes' | 'reset_round' | 'set_issue' | 'update_settings' | 'ping'
  | 'connected' | 'room_state' | 'player_joined' | 'player_left'
  | 'vote_cast' | 'vote_cleared' | 'votes_revealed' | 'round_reset'
  | 'issue_changed' | 'settings_changed' | 'error' | 'pong'

interface WSMessage {
  type: MessageType
  payload?: any
}

// Composable state
const socket = ref<WebSocket | null>(null)
const isConnected = ref(false)
const playerId = ref<string | null>(null)
const roomId = ref<string | null>(null)
const room = ref<Room | null>(null)
const error = ref<string | null>(null)
const reconnectAttempts = ref(0)

const MAX_RECONNECT_ATTEMPTS = 5
const RECONNECT_DELAY = 2000

export function useWebSocket() {
  // Connect to WebSocket server
  const connect = () => {
    if (socket.value?.readyState === WebSocket.OPEN) {
      return
    }

    socket.value = new WebSocket(WS_URL)

    socket.value.onopen = () => {
      isConnected.value = true
      reconnectAttempts.value = 0
      error.value = null
      console.log('WebSocket connected')

      // Rejoin room if we have stored credentials
      if (roomId.value && playerId.value) {
        joinRoom(roomId.value, localStorage.getItem('playerName') || 'Player')
      }
    }

    socket.value.onclose = () => {
      isConnected.value = false
      console.log('WebSocket disconnected')

      // Attempt reconnection
      if (reconnectAttempts.value < MAX_RECONNECT_ATTEMPTS) {
        setTimeout(() => {
          reconnectAttempts.value++
          connect()
        }, RECONNECT_DELAY)
      }
    }

    socket.value.onerror = (e) => {
      console.error('WebSocket error:', e)
      error.value = 'Connection error'
    }

    socket.value.onmessage = (event) => {
      try {
        const message: WSMessage = JSON.parse(event.data)
        handleMessage(message)
      } catch (e) {
        console.error('Failed to parse message:', e)
      }
    }
  }

  // Disconnect from WebSocket
  const disconnect = () => {
    if (socket.value) {
      socket.value.close()
      socket.value = null
    }
    isConnected.value = false
  }

  // Send message to server
  const send = (type: MessageType, payload?: any) => {
    if (socket.value?.readyState !== WebSocket.OPEN) {
      console.error('WebSocket not connected')
      return false
    }

    socket.value.send(JSON.stringify({ type, payload }))
    return true
  }

  // Handle incoming messages
  const handleMessage = (message: WSMessage) => {
    switch (message.type) {
      case 'connected':
        playerId.value = message.payload.playerId
        roomId.value = message.payload.roomId
        localStorage.setItem('playerId', message.payload.playerId)
        break

      case 'room_state':
        room.value = message.payload as Room
        break

      case 'player_joined':
        if (room.value) {
          const exists = room.value.players.some(p => p.id === message.payload.player.id)
          if (!exists) {
            room.value.players.push(message.payload.player)
          }
        }
        break

      case 'player_left':
        if (room.value) {
          room.value.players = room.value.players.filter(
            p => p.id !== message.payload.playerId
          )
        }
        break

      case 'vote_cast':
      case 'vote_cleared':
        if (room.value) {
          const player = room.value.players.find(p => p.id === message.payload.playerId)
          if (player) {
            player.hasVoted = message.payload.hasVoted
          }
        }
        break

      case 'votes_revealed':
        if (room.value) {
          room.value.status = 'revealed'
          room.value.players = message.payload.players
          // Results are available in message.payload.results
        }
        break

      case 'round_reset':
        room.value = message.payload as Room
        break

      case 'issue_changed':
        if (room.value) {
          room.value.currentIssue = message.payload.issue
        }
        break

      case 'settings_changed':
        if (room.value) {
          room.value.settings = message.payload.settings
        }
        break

      case 'error':
        error.value = message.payload.message
        console.error('Server error:', message.payload)
        break

      case 'pong':
        // Heartbeat response
        break
    }
  }

  // Room actions
  const joinRoom = (id: string, playerName: string) => {
    const storedPlayerId = localStorage.getItem('playerId')
    send('join_room', {
      roomId: id,
      playerName,
      playerId: storedPlayerId,
    })
    localStorage.setItem('playerName', playerName)
  }

  const leaveRoom = () => {
    send('leave_room')
    room.value = null
    roomId.value = null
  }

  const castVote = (vote: CardValue) => {
    send('cast_vote', { vote })
  }

  const clearVote = () => {
    send('clear_vote')
  }

  const revealVotes = () => {
    send('reveal_votes')
  }

  const resetRound = () => {
    send('reset_round')
  }

  const setIssue = (issue: string) => {
    send('set_issue', { issue })
  }

  // Computed properties
  const currentPlayer = computed(() => 
    room.value?.players.find(p => p.id === playerId.value) ?? null
  )

  const isHost = computed(() => 
    room.value?.hostId === playerId.value
  )

  const allPlayersVoted = computed(() =>
    room.value?.players.every(p => p.hasVoted) ?? false
  )

  const isRevealed = computed(() =>
    room.value?.status === 'revealed'
  )

  // Start heartbeat
  const startHeartbeat = () => {
    setInterval(() => {
      if (isConnected.value) {
        send('ping')
      }
    }, 30000)
  }

  // Initialize on mount
  onMounted(() => {
    connect()
    startHeartbeat()
  })

  onUnmounted(() => {
    disconnect()
  })

  return {
    // State
    socket,
    isConnected,
    playerId,
    roomId,
    room,
    error,
    currentPlayer,
    isHost,
    allPlayersVoted,
    isRevealed,

    // Actions
    connect,
    disconnect,
    joinRoom,
    leaveRoom,
    castVote,
    clearVote,
    revealVotes,
    resetRound,
    setIssue,
  }
}

// API helpers for REST endpoints
export async function createRoom(name: string, hostName: string) {
  const response = await fetch(`${API_URL}/rooms`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, hostName }),
  })
  return response.json()
}

export async function checkRoom(roomId: string) {
  const response = await fetch(`${API_URL}/rooms/${roomId}/check`)
  return response.json()
}

export async function getRoom(roomId: string) {
  const response = await fetch(`${API_URL}/rooms/${roomId}`)
  return response.json()
}
