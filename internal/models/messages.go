package models

// MessageType represents WebSocket message types
type MessageType string

const (
	// Client -> Server messages
	MsgJoinRoom    MessageType = "join_room"
	MsgLeaveRoom   MessageType = "leave_room"
	MsgCastVote    MessageType = "cast_vote"
	MsgClearVote   MessageType = "clear_vote"
	MsgRevealVotes MessageType = "reveal_votes"
	MsgResetRound  MessageType = "reset_round"
	MsgSetIssue    MessageType = "set_issue"
	MsgUpdateSettings MessageType = "update_settings"
	MsgPing        MessageType = "ping"

	// Server -> Client messages
	MsgRoomState      MessageType = "room_state"
	MsgPlayerJoined   MessageType = "player_joined"
	MsgPlayerLeft     MessageType = "player_left"
	MsgVoteCast       MessageType = "vote_cast"
	MsgVoteCleared    MessageType = "vote_cleared"
	MsgVotesRevealed  MessageType = "votes_revealed"
	MsgRoundReset     MessageType = "round_reset"
	MsgIssueChanged   MessageType = "issue_changed"
	MsgSettingsChanged MessageType = "settings_changed"
	MsgError          MessageType = "error"
	MsgPong           MessageType = "pong"
	MsgConnected      MessageType = "connected"
)

// WSMessage is the base WebSocket message structure
type WSMessage struct {
	Type    MessageType     `json:"type"`
	Payload interface{}     `json:"payload,omitempty"`
}

// JoinRoomPayload contains data for joining a room
type JoinRoomPayload struct {
	RoomID     string `json:"roomId"`
	PlayerName string `json:"playerName"`
	PlayerID   string `json:"playerId,omitempty"` // For reconnection
}

// VotePayload contains vote data
type VotePayload struct {
	Vote CardValue `json:"vote"`
}

// IssuePayload contains issue data
type IssuePayload struct {
	Issue string `json:"issue"`
}

// SettingsPayload contains room settings
type SettingsPayload struct {
	Settings RoomSettings `json:"settings"`
}

// ErrorPayload contains error information
type ErrorPayload struct {
	Code    string `json:"code"`
	Message string `json:"message"`
}

// PlayerEventPayload contains player event data
type PlayerEventPayload struct {
	Player   map[string]interface{} `json:"player"`
	PlayerID string                 `json:"playerId,omitempty"`
}

// VoteEventPayload contains vote event data (without revealing the vote)
type VoteEventPayload struct {
	PlayerID   string `json:"playerId"`
	HasVoted   bool   `json:"hasVoted"`
	VotedCount int    `json:"votedCount"`
	TotalCount int    `json:"totalCount"`
}

// RevealPayload contains revealed votes and results
type RevealPayload struct {
	Players []map[string]interface{} `json:"players"`
	Results *VotingResults           `json:"results"`
}

// ConnectedPayload contains connection confirmation data
type ConnectedPayload struct {
	PlayerID string `json:"playerId"`
	RoomID   string `json:"roomId"`
}

// NewErrorMessage creates an error message
func NewErrorMessage(code, message string) WSMessage {
	return WSMessage{
		Type: MsgError,
		Payload: ErrorPayload{
			Code:    code,
			Message: message,
		},
	}
}

// NewRoomStateMessage creates a room state message
func NewRoomStateMessage(room *Room) WSMessage {
	return WSMessage{
		Type:    MsgRoomState,
		Payload: room.PublicState(),
	}
}
