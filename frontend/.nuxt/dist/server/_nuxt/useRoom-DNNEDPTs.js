import { computed, ref } from "vue";
import { c as useRuntimeConfig } from "../server.mjs";
const FIBONACCI_DECK = [
  { value: "0", label: "0", numericValue: 0 },
  { value: "½", label: "½", numericValue: 0.5 },
  { value: "1", label: "1", numericValue: 1 },
  { value: "2", label: "2", numericValue: 2 },
  { value: "3", label: "3", numericValue: 3 },
  { value: "5", label: "5", numericValue: 5 },
  { value: "8", label: "8", numericValue: 8 },
  { value: "13", label: "13", numericValue: 13 },
  { value: "21", label: "21", numericValue: 21 },
  { value: "34", label: "34", numericValue: 34 },
  { value: "55", label: "55", numericValue: 55 },
  { value: "89", label: "89", numericValue: 89 },
  { value: "?", label: "?", numericValue: null },
  { value: "☕", label: "☕", numericValue: null }
];
const MODIFIED_FIBONACCI_DECK = [
  { value: "0", label: "0", numericValue: 0 },
  { value: "½", label: "½", numericValue: 0.5 },
  { value: "1", label: "1", numericValue: 1 },
  { value: "2", label: "2", numericValue: 2 },
  { value: "3", label: "3", numericValue: 3 },
  { value: "5", label: "5", numericValue: 5 },
  { value: "8", label: "8", numericValue: 8 },
  { value: "13", label: "13", numericValue: 13 },
  { value: "21", label: "21", numericValue: 21 },
  { value: "?", label: "?", numericValue: null },
  { value: "☕", label: "☕", numericValue: null }
];
function usePokerDeck(deckType = "modified") {
  const deck = computed(
    () => deckType === "fibonacci" ? FIBONACCI_DECK : MODIFIED_FIBONACCI_DECK
  );
  const getCard = (value) => {
    return deck.value.find((card) => card.value === value);
  };
  const getNumericValue = (value) => {
    const card = getCard(value);
    return card?.numericValue ?? null;
  };
  const isNumericCard = (value) => {
    return getNumericValue(value) !== null;
  };
  return {
    deck,
    getCard,
    getNumericValue,
    isNumericCard
  };
}
const currentRoom = ref(null);
const currentPlayer = ref(null);
const wsConnection = ref(null);
const isConnected = ref(false);
const connectionError = ref(null);
function getApiBase() {
  const config = useRuntimeConfig();
  return config.public.apiBase || "";
}
function getWsBase() {
  const config = useRuntimeConfig();
  const apiBase = config.public.apiBase || "";
  if (apiBase.startsWith("http")) {
    return apiBase.replace(/^http/, "ws");
  }
  return "";
}
function useRoom() {
  const { getNumericValue } = usePokerDeck();
  const isHost = computed(
    () => currentPlayer.value?.id === currentRoom.value?.host
  );
  const players = computed(() => currentRoom.value?.players ?? []);
  const votedPlayers = computed(
    () => players.value.filter((p) => p.hasVoted)
  );
  const allPlayersVoted = computed(
    () => players.value.length > 0 && players.value.every((p) => p.hasVoted)
  );
  const status = computed(() => currentRoom.value?.status ?? "waiting");
  const isRevealed = computed(() => status.value === "revealed");
  const votingResults = computed(() => {
    if (!isRevealed.value) return null;
    const votes = players.value.filter((p) => p.vote !== null).map((p) => p.vote);
    if (votes.length === 0) return null;
    const distribution = votes.reduce((acc, vote) => {
      acc[vote] = (acc[vote] || 0) + 1;
      return acc;
    }, {});
    const numericVotes = votes.map((v) => getNumericValue(v)).filter((v) => v !== null);
    const average = numericVotes.length > 0 ? numericVotes.reduce((a, b) => a + b, 0) / numericVotes.length : null;
    const sortedVotes = [...numericVotes].sort((a, b) => a - b);
    const median = numericVotes.length > 0 ? sortedVotes.length % 2 === 0 ? (sortedVotes[sortedVotes.length / 2 - 1] + sortedVotes[sortedVotes.length / 2]) / 2 : sortedVotes[Math.floor(sortedVotes.length / 2)] : null;
    const maxCount = Math.max(...Object.values(distribution));
    const mode = Object.entries(distribution).find(([_, count]) => count === maxCount)?.[0] ?? null;
    const consensus = Object.keys(distribution).length === 1;
    return {
      average,
      median,
      mode,
      consensus,
      distribution,
      totalVotes: votes.length,
      validVotes: numericVotes.length
    };
  });
  function connectWebSocket() {
    return new Promise((resolve, reject) => {
      if (wsConnection.value?.readyState === WebSocket.OPEN) {
        resolve();
        return;
      }
      const wsBase = getWsBase();
      const ws = new WebSocket(`${wsBase}/ws`);
      ws.onopen = () => {
        isConnected.value = true;
        connectionError.value = null;
        resolve();
      };
      ws.onclose = () => {
        isConnected.value = false;
        wsConnection.value = null;
      };
      ws.onerror = () => {
        connectionError.value = "WebSocket connection failed";
        reject(new Error("WebSocket connection failed"));
      };
      ws.onmessage = (event) => {
        handleWSMessage(event.data);
      };
      wsConnection.value = ws;
    });
  }
  function sendWSMessage(msg) {
    if (wsConnection.value?.readyState === WebSocket.OPEN) {
      wsConnection.value.send(JSON.stringify(msg));
    }
  }
  function handleWSMessage(data) {
    try {
      const msg = JSON.parse(data);
      switch (msg.type) {
        case "connected":
          break;
        case "room_state":
          updateRoomState(msg.payload);
          break;
        case "player_joined": {
          const playerData = msg.payload?.player;
          if (playerData && currentRoom.value) {
            const existing = currentRoom.value.players.find((p) => p.id === playerData.id);
            if (!existing) {
              currentRoom.value.players.push(mapPlayer(playerData));
            }
          }
          break;
        }
        case "player_left": {
          const playerId = msg.payload?.playerId;
          if (playerId && currentRoom.value) {
            currentRoom.value.players = currentRoom.value.players.filter((p) => p.id !== playerId);
          }
          break;
        }
        case "vote_cast": {
          if (currentRoom.value) {
            const { playerId, hasVoted } = msg.payload;
            const player = currentRoom.value.players.find((p) => p.id === playerId);
            if (player) {
              player.hasVoted = hasVoted;
            }
            currentRoom.value.status = "voting";
          }
          break;
        }
        case "vote_cleared": {
          if (currentRoom.value) {
            const { playerId } = msg.payload;
            const player = currentRoom.value.players.find((p) => p.id === playerId);
            if (player) {
              player.hasVoted = false;
              player.vote = null;
            }
          }
          break;
        }
        case "votes_revealed": {
          if (currentRoom.value) {
            currentRoom.value.status = "revealed";
            const revealedPlayers = msg.payload?.players || [];
            for (const rp of revealedPlayers) {
              const player = currentRoom.value.players.find((p) => p.id === rp.id);
              if (player) {
                player.vote = rp.vote || null;
                player.hasVoted = rp.hasVoted;
              }
            }
          }
          break;
        }
        case "round_reset":
          if (currentRoom.value) {
            updateRoomState(msg.payload);
          }
          break;
        case "issue_changed":
          if (currentRoom.value) {
            currentRoom.value.currentIssue = msg.payload?.issue || null;
          }
          break;
        case "settings_changed":
          if (currentRoom.value) {
            currentRoom.value.settings = {
              ...currentRoom.value.settings,
              ...msg.payload?.settings
            };
          }
          break;
        case "error":
          console.error("Server error:", msg.payload?.message);
          break;
        case "pong":
          break;
      }
    } catch (e) {
      console.error("Failed to parse WS message:", e);
    }
  }
  function mapPlayer(data) {
    return {
      id: data.id,
      name: data.name,
      isHost: data.isHost ?? false,
      vote: data.vote ?? null,
      hasVoted: data.hasVoted ?? false,
      isOnline: data.isOnline ?? true
    };
  }
  function updateRoomState(state) {
    if (!state || !currentRoom.value) return;
    currentRoom.value.name = state.name ?? currentRoom.value.name;
    currentRoom.value.host = state.hostId ?? currentRoom.value.host;
    currentRoom.value.status = state.status ?? currentRoom.value.status;
    currentRoom.value.currentIssue = state.currentIssue || null;
    currentRoom.value.deck = state.deck ?? currentRoom.value.deck;
    currentRoom.value.settings = state.settings ?? currentRoom.value.settings;
    if (state.players) {
      currentRoom.value.players = state.players.map(mapPlayer);
    }
  }
  async function createRoom(name, playerName) {
    const apiBase = getApiBase();
    const response = await $fetch(`${apiBase}/api/rooms`, {
      method: "POST",
      body: { name, hostName: playerName }
    });
    const roomData = response.room;
    const playerId = response.playerId;
    const room = {
      id: roomData.id,
      name: roomData.name,
      host: roomData.hostId,
      players: (roomData.players || []).map(mapPlayer),
      currentIssue: roomData.currentIssue || null,
      status: roomData.status,
      deck: roomData.deck || [],
      createdAt: /* @__PURE__ */ new Date(),
      settings: roomData.settings || {
        allowSpectators: true,
        autoReveal: false,
        showAverage: true,
        timer: null
      }
    };
    currentRoom.value = room;
    currentPlayer.value = room.players.find((p) => p.id === playerId) || null;
    await connectWebSocket();
    sendWSMessage({
      type: "join_room",
      payload: {
        roomId: room.id,
        playerName,
        playerId
      }
    });
    return room;
  }
  async function joinRoom(roomId, playerName) {
    try {
      const apiBase = getApiBase();
      const response = await $fetch(`${apiBase}/api/rooms/${roomId}/join`, {
        method: "POST",
        body: { playerName }
      });
      const roomData = response.room;
      const playerId = response.playerId;
      const room = {
        id: roomData.id,
        name: roomData.name,
        host: roomData.hostId,
        players: (roomData.players || []).map(mapPlayer),
        currentIssue: roomData.currentIssue || null,
        status: roomData.status,
        deck: roomData.deck || [],
        createdAt: /* @__PURE__ */ new Date(),
        settings: roomData.settings || {
          allowSpectators: true,
          autoReveal: false,
          showAverage: true,
          timer: null
        }
      };
      currentRoom.value = room;
      currentPlayer.value = room.players.find((p) => p.id === playerId) || null;
      await connectWebSocket();
      sendWSMessage({
        type: "join_room",
        payload: {
          roomId: room.id,
          playerName,
          playerId
        }
      });
      return true;
    } catch {
      return false;
    }
  }
  async function checkRoom(roomId) {
    try {
      const apiBase = getApiBase();
      const response = await $fetch(`${apiBase}/api/rooms/${roomId}/check`);
      return response.exists;
    } catch {
      return false;
    }
  }
  function castVote(value) {
    if (!currentRoom.value || !currentPlayer.value) return;
    if (currentRoom.value.status === "revealed") return;
    const player = currentRoom.value.players.find((p) => p.id === currentPlayer.value?.id);
    if (player) {
      player.vote = value;
      player.hasVoted = true;
      currentRoom.value.status = "voting";
    }
    sendWSMessage({
      type: "cast_vote",
      payload: { vote: value }
    });
  }
  function clearVote() {
    if (!currentRoom.value || !currentPlayer.value) return;
    if (currentRoom.value.status === "revealed") return;
    const player = currentRoom.value.players.find((p) => p.id === currentPlayer.value?.id);
    if (player) {
      player.vote = null;
      player.hasVoted = false;
    }
    sendWSMessage({ type: "clear_vote" });
  }
  function revealVotes() {
    sendWSMessage({ type: "reveal_votes" });
  }
  function resetRound() {
    sendWSMessage({ type: "reset_round" });
  }
  function setIssue(issue) {
    if (currentRoom.value) {
      currentRoom.value.currentIssue = issue;
    }
    sendWSMessage({
      type: "set_issue",
      payload: { issue }
    });
  }
  function updateSettings(settings) {
    if (!currentRoom.value) return;
    const merged = { ...currentRoom.value.settings, ...settings };
    currentRoom.value.settings = merged;
    sendWSMessage({
      type: "update_settings",
      payload: { settings: merged }
    });
  }
  function leaveRoom() {
    sendWSMessage({ type: "leave_room" });
    if (wsConnection.value) {
      wsConnection.value.close();
      wsConnection.value = null;
    }
    currentRoom.value = null;
    currentPlayer.value = null;
    isConnected.value = false;
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
    leaveRoom
  };
}
export {
  usePokerDeck as a,
  useRoom as u
};
//# sourceMappingURL=useRoom-DNNEDPTs.js.map
