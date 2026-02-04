package websocket

import (
	"encoding/json"
	"errors"
	"log"
	"sync"

	"github.com/google/uuid"
	"github.com/scrum-poker/backend/internal/models"
	"github.com/scrum-poker/backend/internal/room"
)

var (
	ErrClientBufferFull = errors.New("client send buffer full")
	ErrRoomNotFound     = errors.New("room not found")
	ErrNotAuthorized    = errors.New("not authorized")
)

// Hub maintains active clients and broadcasts messages
type Hub struct {
	// Room manager
	roomManager *room.Manager

	// Registered clients by room
	mu      sync.RWMutex
	rooms   map[string]map[*Client]bool

	// Register requests from clients
	register chan *Client

	// Unregister requests from clients
	unregister chan *Client
}

// NewHub creates a new hub
func NewHub(roomManager *room.Manager) *Hub {
	return &Hub{
		roomManager: roomManager,
		rooms:       make(map[string]map[*Client]bool),
		register:    make(chan *Client),
		unregister:  make(chan *Client),
	}
}

// Run starts the hub's main loop
func (h *Hub) Run() {
	for {
		select {
		case <-h.register:
			// Client registration is handled in HandleMessage when joining a room
			log.Printf("Client connected")

		case client := <-h.unregister:
			h.handleDisconnect(client)
		}
	}
}

// handleDisconnect handles client disconnection
func (h *Hub) handleDisconnect(client *Client) {
	roomID, playerID := client.GetRoom()
	if roomID == "" {
		return
	}

	h.mu.Lock()
	if clients, ok := h.rooms[roomID]; ok {
		if _, ok := clients[client]; ok {
			delete(clients, client)
			client.Close()

			// Clean up empty room map
			if len(clients) == 0 {
				delete(h.rooms, roomID)
			}
		}
	}
	h.mu.Unlock()

	// Update player status in room
	if room := h.roomManager.GetRoom(roomID); room != nil {
		room.SetPlayerOnline(playerID, false)

		// Notify other players
		h.BroadcastToRoom(roomID, models.WSMessage{
			Type: models.MsgPlayerLeft,
			Payload: models.PlayerEventPayload{
				PlayerID: playerID,
			},
		}, client)

		// Broadcast updated room state
		h.BroadcastToRoom(roomID, models.NewRoomStateMessage(room), nil)
	}

	log.Printf("Client disconnected from room %s", roomID)
}

// RegisterClient registers a client to the hub
func (h *Hub) RegisterClient(client *Client) {
	h.register <- client
}

// HandleMessage processes incoming WebSocket messages
func (h *Hub) HandleMessage(client *Client, msg models.WSMessage) {
	switch msg.Type {
	case models.MsgJoinRoom:
		h.handleJoinRoom(client, msg.Payload)
	case models.MsgLeaveRoom:
		h.handleLeaveRoom(client)
	case models.MsgCastVote:
		h.handleCastVote(client, msg.Payload)
	case models.MsgClearVote:
		h.handleClearVote(client)
	case models.MsgRevealVotes:
		h.handleRevealVotes(client)
	case models.MsgResetRound:
		h.handleResetRound(client)
	case models.MsgSetIssue:
		h.handleSetIssue(client, msg.Payload)
	case models.MsgUpdateSettings:
		h.handleUpdateSettings(client, msg.Payload)
	case models.MsgPing:
		client.Send(models.WSMessage{Type: models.MsgPong})
	default:
		client.Send(models.NewErrorMessage("unknown_type", "Unknown message type"))
	}
}

// handleJoinRoom handles room join requests
func (h *Hub) handleJoinRoom(client *Client, payload interface{}) {
	data, err := json.Marshal(payload)
	if err != nil {
		client.Send(models.NewErrorMessage("invalid_payload", "Invalid join payload"))
		return
	}

	var joinPayload models.JoinRoomPayload
	if err := json.Unmarshal(data, &joinPayload); err != nil {
		client.Send(models.NewErrorMessage("invalid_payload", "Invalid join payload"))
		return
	}

	// Validate input
	if joinPayload.RoomID == "" || joinPayload.PlayerName == "" {
		client.Send(models.NewErrorMessage("validation_error", "Room ID and player name are required"))
		return
	}

	// Generate player ID if not provided
	playerID := joinPayload.PlayerID
	if playerID == "" {
		playerID = uuid.New().String()
	}

	// Join room
	room, player, err := h.roomManager.JoinRoom(joinPayload.RoomID, playerID, joinPayload.PlayerName)
	if err != nil {
		client.Send(models.NewErrorMessage("room_not_found", err.Error()))
		return
	}

	// Set client room
	client.SetRoom(joinPayload.RoomID, playerID)

	// Add client to room's client list
	h.mu.Lock()
	if h.rooms[joinPayload.RoomID] == nil {
		h.rooms[joinPayload.RoomID] = make(map[*Client]bool)
	}
	h.rooms[joinPayload.RoomID][client] = true
	h.mu.Unlock()

	// Send connected confirmation
	client.Send(models.WSMessage{
		Type: models.MsgConnected,
		Payload: models.ConnectedPayload{
			PlayerID: playerID,
			RoomID:   joinPayload.RoomID,
		},
	})

	// Send current room state to joining client
	client.Send(models.NewRoomStateMessage(room))

	// Notify other players
	h.BroadcastToRoom(joinPayload.RoomID, models.WSMessage{
		Type: models.MsgPlayerJoined,
		Payload: models.PlayerEventPayload{
			Player: player.Public(room.Status == models.StatusRevealed),
		},
	}, client)

	log.Printf("Player %s joined room %s", joinPayload.PlayerName, joinPayload.RoomID)
}

// handleLeaveRoom handles room leave requests
func (h *Hub) handleLeaveRoom(client *Client) {
	roomID, playerID := client.GetRoom()
	if roomID == "" {
		return
	}

	player, roomDeleted := h.roomManager.LeaveRoom(roomID, playerID)
	if player == nil {
		return
	}

	// Remove from room clients
	h.mu.Lock()
	if clients, ok := h.rooms[roomID]; ok {
		delete(clients, client)
		if len(clients) == 0 || roomDeleted {
			delete(h.rooms, roomID)
		}
	}
	h.mu.Unlock()

	// Clear client's room association
	client.SetRoom("", "")

	if !roomDeleted {
		// Notify other players
		h.BroadcastToRoom(roomID, models.WSMessage{
			Type: models.MsgPlayerLeft,
			Payload: models.PlayerEventPayload{
				PlayerID: playerID,
			},
		}, nil)

		// Broadcast updated state
		if room := h.roomManager.GetRoom(roomID); room != nil {
			h.BroadcastToRoom(roomID, models.NewRoomStateMessage(room), nil)
		}
	}
}

// handleCastVote handles vote casting
func (h *Hub) handleCastVote(client *Client, payload interface{}) {
	roomID, playerID := client.GetRoom()
	if roomID == "" {
		client.Send(models.NewErrorMessage("not_in_room", "You must join a room first"))
		return
	}

	data, err := json.Marshal(payload)
	if err != nil {
		client.Send(models.NewErrorMessage("invalid_payload", "Invalid vote payload"))
		return
	}

	var votePayload models.VotePayload
	if err := json.Unmarshal(data, &votePayload); err != nil {
		client.Send(models.NewErrorMessage("invalid_payload", "Invalid vote payload"))
		return
	}

	room := h.roomManager.GetRoom(roomID)
	if room == nil {
		client.Send(models.NewErrorMessage("room_not_found", "Room not found"))
		return
	}

	if !room.CastVote(playerID, votePayload.Vote) {
		client.Send(models.NewErrorMessage("vote_failed", "Could not cast vote"))
		return
	}

	// Broadcast vote event (without revealing the vote)
	h.BroadcastToRoom(roomID, models.WSMessage{
		Type: models.MsgVoteCast,
		Payload: models.VoteEventPayload{
			PlayerID:   playerID,
			HasVoted:   true,
			VotedCount: room.VotedCount(),
			TotalCount: room.PlayerCount(),
		},
	}, nil)

	// Auto-reveal if all voted and setting enabled
	if room.Settings.AutoReveal && room.AllPlayersVoted() {
		h.revealVotes(room, roomID)
	}
}

// handleClearVote handles vote clearing
func (h *Hub) handleClearVote(client *Client) {
	roomID, playerID := client.GetRoom()
	if roomID == "" {
		return
	}

	room := h.roomManager.GetRoom(roomID)
	if room == nil {
		return
	}

	if room.ClearVote(playerID) {
		h.BroadcastToRoom(roomID, models.WSMessage{
			Type: models.MsgVoteCleared,
			Payload: models.VoteEventPayload{
				PlayerID:   playerID,
				HasVoted:   false,
				VotedCount: room.VotedCount(),
				TotalCount: room.PlayerCount(),
			},
		}, nil)
	}
}

// handleRevealVotes handles vote reveal (host only)
func (h *Hub) handleRevealVotes(client *Client) {
	roomID, playerID := client.GetRoom()
	if roomID == "" {
		return
	}

	room := h.roomManager.GetRoom(roomID)
	if room == nil {
		return
	}

	// Check if player is host
	if room.HostID != playerID {
		client.Send(models.NewErrorMessage("not_authorized", "Only the host can reveal votes"))
		return
	}

	h.revealVotes(room, roomID)
}

// revealVotes reveals votes and broadcasts results
func (h *Hub) revealVotes(room *models.Room, roomID string) {
	room.RevealVotes()

	// Build players list with revealed votes
	players := room.PublicPlayers(true)

	h.BroadcastToRoom(roomID, models.WSMessage{
		Type: models.MsgVotesRevealed,
		Payload: models.RevealPayload{
			Players: players,
			Results: room.CalculateResults(),
		},
	}, nil)
}

// handleResetRound handles round reset (host only)
func (h *Hub) handleResetRound(client *Client) {
	roomID, playerID := client.GetRoom()
	if roomID == "" {
		return
	}

	room := h.roomManager.GetRoom(roomID)
	if room == nil {
		return
	}

	// Check if player is host
	if room.HostID != playerID {
		client.Send(models.NewErrorMessage("not_authorized", "Only the host can reset the round"))
		return
	}

	room.ResetRound()

	h.BroadcastToRoom(roomID, models.WSMessage{
		Type:    models.MsgRoundReset,
		Payload: room.PublicState(),
	}, nil)
}

// handleSetIssue handles setting current issue (host only)
func (h *Hub) handleSetIssue(client *Client, payload interface{}) {
	roomID, playerID := client.GetRoom()
	if roomID == "" {
		return
	}

	room := h.roomManager.GetRoom(roomID)
	if room == nil {
		return
	}

	// Check if player is host
	if room.HostID != playerID {
		client.Send(models.NewErrorMessage("not_authorized", "Only the host can set the issue"))
		return
	}

	data, err := json.Marshal(payload)
	if err != nil {
		return
	}

	var issuePayload models.IssuePayload
	if err := json.Unmarshal(data, &issuePayload); err != nil {
		return
	}

	room.SetIssue(issuePayload.Issue)

	h.BroadcastToRoom(roomID, models.WSMessage{
		Type:    models.MsgIssueChanged,
		Payload: issuePayload,
	}, nil)
}

// handleUpdateSettings handles settings update (host only)
func (h *Hub) handleUpdateSettings(client *Client, payload interface{}) {
	roomID, playerID := client.GetRoom()
	if roomID == "" {
		return
	}

	room := h.roomManager.GetRoom(roomID)
	if room == nil {
		return
	}

	// Check if player is host
	if room.HostID != playerID {
		client.Send(models.NewErrorMessage("not_authorized", "Only the host can update settings"))
		return
	}

	data, err := json.Marshal(payload)
	if err != nil {
		return
	}

	var settingsPayload models.SettingsPayload
	if err := json.Unmarshal(data, &settingsPayload); err != nil {
		return
	}

	room.UpdateSettings(settingsPayload.Settings)

	h.BroadcastToRoom(roomID, models.WSMessage{
		Type:    models.MsgSettingsChanged,
		Payload: settingsPayload,
	}, nil)
}

// BroadcastToRoom sends a message to all clients in a room
func (h *Hub) BroadcastToRoom(roomID string, msg models.WSMessage, exclude *Client) {
	data, err := json.Marshal(msg)
	if err != nil {
		log.Printf("Failed to marshal broadcast message: %v", err)
		return
	}

	h.mu.RLock()
	clients := h.rooms[roomID]
	h.mu.RUnlock()

	for client := range clients {
		if client != exclude {
			select {
			case client.send <- data:
			default:
				// Client buffer full, will be cleaned up
			}
		}
	}
}

// GetRoomClients returns the number of connected clients in a room
func (h *Hub) GetRoomClients(roomID string) int {
	h.mu.RLock()
	defer h.mu.RUnlock()
	return len(h.rooms[roomID])
}

// GetTotalClients returns total connected clients
func (h *Hub) GetTotalClients() int {
	h.mu.RLock()
	defer h.mu.RUnlock()

	total := 0
	for _, clients := range h.rooms {
		total += len(clients)
	}
	return total
}
