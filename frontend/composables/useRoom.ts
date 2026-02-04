import type { Room, Player, CardValue, RoomStatus, VotingResult, RoomSettings, WSMessage } from '~/types'

const currentRoom = ref<Room | null>(null)
const currentPlayer = ref<Player | null>(null)
const wsConnection = ref<WebSocket | null>(null)
const isConnected = ref(false)
const connectionError = ref<string | null>(null)

function getApiBase(): string {
  const config = useRuntimeConfig()
  return (config.public.apiBase as string) || ''
}

function getWsBase(): string {
  const config = useRuntimeConfig()
  const apiBase = (config.public.apiBase as string) || ''
  if (apiBase.startsWith('http')) {
    return apiBase.replace(/^http/, 'ws')
  }
  if (typeof window !== 'undefined') {
    const proto = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
    return `${proto}//${window.location.host}`
  }
  return ''
}

export function useRoom() {
  const { getNumericValue } = usePokerDeck()

  // Room getters
  const isHost = computed(() =>
    currentPlayer.value?.id === currentRoom.value?.host
  )

  const players = computed(() => currentRoom.value?.players ?? [])

  const votedPlayers = computed(() =>
    players.value.filter(p => p.hasVoted)
  )

  const allPlayersVoted = computed(() =>
    players.value.length > 0 &&
    players.value.every(p => p.hasVoted)
  )

  const status = computed(() => currentRoom.value?.status ?? 'waiting')

  const isRevealed = computed(() => status.value === 'revealed')

  // Calculate voting results
  const votingResults = computed((): VotingResult | null => {
    if (!isRevealed.value) return null

    const votes = players.value
      .filter(p => p.vote !== null)
      .map(p => p.vote as CardValue)

    if (votes.length === 0) return null

    const distribution = votes.reduce((acc, vote) => {
      acc[vote] = (acc[vote] || 0) + 1
      return acc
    }, {} as Record<CardValue, number>)

    const numericVotes = votes
      .map(v => getNumericValue(v))
      .filter((v): v is number => v !== null)

    const average = numericVotes.length > 0
      ? numericVotes.reduce((a, b) => a + b, 0) / numericVotes.length
      : null

    const sortedVotes = [...numericVotes].sort((a, b) => a - b)
    const median = numericVotes.length > 0
      ? sortedVotes.length % 2 === 0
        ? (sortedVotes[sortedVotes.length / 2 - 1] + sortedVotes[sortedVotes.length / 2]) / 2
        : sortedVotes[Math.floor(sortedVotes.length / 2)]
      : null

    const maxCount = Math.max(...Object.values(distribution))
    const mode = Object.entries(distribution)
      .find(([_, count]) => count === maxCount)?.[0] as CardValue | undefined ?? null

    const consensus = Object.keys(distribution).length === 1

    return {
      average,
      median,
      mode,
      consensus,
      distribution,
      totalVotes: votes.length,
      validVotes: numericVotes.length,
    }
  })

  // WebSocket connection management
  function connectWebSocket(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (wsConnection.value?.readyState === WebSocket.OPEN) {
        resolve()
        return
      }

      const wsBase = getWsBase()
      const ws = new WebSocket(`${wsBase}/ws`)

      ws.onopen = () => {
        isConnected.value = true
        connectionError.value = null
        resolve()
      }

      ws.onclose = () => {
        isConnected.value = false
        wsConnection.value = null
      }

      ws.onerror = () => {
        connectionError.value = 'WebSocket connection failed'
        reject(new Error('WebSocket connection failed'))
      }

      ws.onmessage = (event: MessageEvent) => {
        handleWSMessage(event.data)
      }

      wsConnection.value = ws
    })
  }

  function sendWSMessage(msg: WSMessage) {
    if (wsConnection.value?.readyState === WebSocket.OPEN) {
      wsConnection.value.send(JSON.stringify(msg))
    }
  }

  function handleWSMessage(data: string) {
    try {
      const msg: WSMessage = JSON.parse(data)

      switch (msg.type) {
        case 'connected':
          break

        case 'room_state':
          updateRoomState(msg.payload)
          break

        case 'player_joined': {
          const playerData = msg.payload?.player
          if (playerData && currentRoom.value) {
            const existing = currentRoom.value.players.find(p => p.id === playerData.id)
            if (!existing) {
              currentRoom.value.players.push(mapPlayer(playerData))
            }
          }
          break
        }

        case 'player_left': {
          const playerId = msg.payload?.playerId
          if (playerId && currentRoom.value) {
            currentRoom.value.players = currentRoom.value.players.filter(p => p.id !== playerId)
          }
          break
        }

        case 'vote_cast': {
          if (currentRoom.value) {
            const { playerId, hasVoted } = msg.payload
            const player = currentRoom.value.players.find(p => p.id === playerId)
            if (player) {
              player.hasVoted = hasVoted
            }
            currentRoom.value.status = 'voting'
          }
          break
        }

        case 'vote_cleared': {
          if (currentRoom.value) {
            const { playerId } = msg.payload
            const player = currentRoom.value.players.find(p => p.id === playerId)
            if (player) {
              player.hasVoted = false
              player.vote = null
            }
          }
          break
        }

        case 'votes_revealed': {
          if (currentRoom.value) {
            currentRoom.value.status = 'revealed'
            const revealedPlayers = msg.payload?.players || []
            for (const rp of revealedPlayers) {
              const player = currentRoom.value.players.find(p => p.id === rp.id)
              if (player) {
                player.vote = rp.vote || null
                player.hasVoted = rp.hasVoted
              }
            }
          }
          break
        }

        case 'round_reset':
          if (currentRoom.value) {
            updateRoomState(msg.payload)
          }
          break

        case 'issue_changed':
          if (currentRoom.value) {
            currentRoom.value.currentIssue = msg.payload?.issue || null
          }
          break

        case 'settings_changed':
          if (currentRoom.value) {
            currentRoom.value.settings = {
              ...currentRoom.value.settings,
              ...msg.payload?.settings,
            }
          }
          break

        case 'error':
          console.error('Server error:', msg.payload?.message)
          break

        case 'pong':
          break
      }
    } catch (e) {
      console.error('Failed to parse WS message:', e)
    }
  }

  function mapPlayer(data: any): Player {
    return {
      id: data.id,
      name: data.name,
      isHost: data.isHost ?? false,
      vote: data.vote ?? null,
      hasVoted: data.hasVoted ?? false,
      isOnline: data.isOnline ?? true,
    }
  }

  function updateRoomState(state: any) {
    if (!state || !currentRoom.value) return

    currentRoom.value.name = state.name ?? currentRoom.value.name
    currentRoom.value.host = state.hostId ?? currentRoom.value.host
    currentRoom.value.status = state.status ?? currentRoom.value.status
    currentRoom.value.currentIssue = state.currentIssue || null
    currentRoom.value.deck = state.deck ?? currentRoom.value.deck
    currentRoom.value.settings = state.settings ?? currentRoom.value.settings

    if (state.players) {
      currentRoom.value.players = state.players.map(mapPlayer)
    }
  }

  // Actions
  async function createRoom(name: string, playerName: string): Promise<Room> {
    const apiBase = getApiBase()
    const response = await $fetch<{ room: any; playerId: string }>(`${apiBase}/api/rooms`, {
      method: 'POST',
      body: { name, hostName: playerName },
    })

    const roomData = response.room
    const playerId = response.playerId

    const room: Room = {
      id: roomData.id,
      name: roomData.name,
      host: roomData.hostId,
      players: (roomData.players || []).map(mapPlayer),
      currentIssue: roomData.currentIssue || null,
      status: roomData.status as RoomStatus,
      deck: roomData.deck || [],
      createdAt: new Date(),
      settings: roomData.settings || {
        allowSpectators: true,
        autoReveal: false,
        showAverage: true,
        timer: null,
      },
    }

    currentRoom.value = room
    currentPlayer.value = room.players.find(p => p.id === playerId) || null

    await connectWebSocket()
    sendWSMessage({
      type: 'join_room',
      payload: {
        roomId: room.id,
        playerName,
        playerId,
      },
    })

    return room
  }

  async function joinRoom(roomId: string, playerName: string): Promise<boolean> {
    try {
      const apiBase = getApiBase()
      const response = await $fetch<{ room: any; playerId: string }>(`${apiBase}/api/rooms/${roomId}/join`, {
        method: 'POST',
        body: { playerName },
      })

      const roomData = response.room
      const playerId = response.playerId

      const room: Room = {
        id: roomData.id,
        name: roomData.name,
        host: roomData.hostId,
        players: (roomData.players || []).map(mapPlayer),
        currentIssue: roomData.currentIssue || null,
        status: roomData.status as RoomStatus,
        deck: roomData.deck || [],
        createdAt: new Date(),
        settings: roomData.settings || {
          allowSpectators: true,
          autoReveal: false,
          showAverage: true,
          timer: null,
        },
      }

      currentRoom.value = room
      currentPlayer.value = room.players.find(p => p.id === playerId) || null

      await connectWebSocket()
      sendWSMessage({
        type: 'join_room',
        payload: {
          roomId: room.id,
          playerName,
          playerId,
        },
      })

      return true
    } catch {
      return false
    }
  }

  async function checkRoom(roomId: string): Promise<boolean> {
    try {
      const apiBase = getApiBase()
      const response = await $fetch<{ exists: boolean }>(`${apiBase}/api/rooms/${roomId}/check`)
      return response.exists
    } catch {
      return false
    }
  }

  function castVote(value: CardValue) {
    if (!currentRoom.value || !currentPlayer.value) return
    if (currentRoom.value.status === 'revealed') return

    const player = currentRoom.value.players.find(p => p.id === currentPlayer.value?.id)
    if (player) {
      player.vote = value
      player.hasVoted = true
      currentRoom.value.status = 'voting'
    }

    sendWSMessage({
      type: 'cast_vote',
      payload: { vote: value },
    })
  }

  function clearVote() {
    if (!currentRoom.value || !currentPlayer.value) return
    if (currentRoom.value.status === 'revealed') return

    const player = currentRoom.value.players.find(p => p.id === currentPlayer.value?.id)
    if (player) {
      player.vote = null
      player.hasVoted = false
    }

    sendWSMessage({ type: 'clear_vote' })
  }

  function revealVotes() {
    sendWSMessage({ type: 'reveal_votes' })
  }

  function resetRound() {
    sendWSMessage({ type: 'reset_round' })
  }

  function setIssue(issue: string) {
    if (currentRoom.value) {
      currentRoom.value.currentIssue = issue
    }
    sendWSMessage({
      type: 'set_issue',
      payload: { issue },
    })
  }

  function updateSettings(settings: Partial<RoomSettings>) {
    if (!currentRoom.value) return
    const merged = { ...currentRoom.value.settings, ...settings }
    currentRoom.value.settings = merged
    sendWSMessage({
      type: 'update_settings',
      payload: { settings: merged },
    })
  }

  function leaveRoom() {
    sendWSMessage({ type: 'leave_room' })

    if (wsConnection.value) {
      wsConnection.value.close()
      wsConnection.value = null
    }

    currentRoom.value = null
    currentPlayer.value = null
    isConnected.value = false
  }

  return {
    // State
    room: currentRoom,
    player: currentPlayer,
    players,
    votedPlayers,
    isHost,
    allPlayersVoted,
    status,
    isRevealed,
    votingResults,
    isConnected,
    connectionError,

    // Actions
    createRoom,
    joinRoom,
    checkRoom,
    castVote,
    clearVote,
    revealVotes,
    resetRound,
    setIssue,
    updateSettings,
    leaveRoom,
  }
}
