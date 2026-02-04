package models

import (
	"sync"
	"time"
)

// CardValue represents valid poker card values
type CardValue string

const (
	CardZero     CardValue = "0"
	CardHalf     CardValue = "½"
	CardOne      CardValue = "1"
	CardTwo      CardValue = "2"
	CardThree    CardValue = "3"
	CardFive     CardValue = "5"
	CardEight    CardValue = "8"
	CardThirteen CardValue = "13"
	CardTwentyOne CardValue = "21"
	CardThirtyFour CardValue = "34"
	CardFiftyFive CardValue = "55"
	CardEightyNine CardValue = "89"
	CardQuestion CardValue = "?"
	CardCoffee   CardValue = "☕"
)

// CardNumericValues maps card values to numeric equivalents
var CardNumericValues = map[CardValue]float64{
	CardZero:       0,
	CardHalf:       0.5,
	CardOne:        1,
	CardTwo:        2,
	CardThree:      3,
	CardFive:       5,
	CardEight:      8,
	CardThirteen:   13,
	CardTwentyOne:  21,
	CardThirtyFour: 34,
	CardFiftyFive:  55,
	CardEightyNine: 89,
}

// IsNumericCard checks if a card has a numeric value
func (c CardValue) IsNumeric() bool {
	_, ok := CardNumericValues[c]
	return ok
}

// NumericValue returns the numeric value of a card, or -1 if non-numeric
func (c CardValue) NumericValue() float64 {
	if v, ok := CardNumericValues[c]; ok {
		return v
	}
	return -1
}

// RoomStatus represents the current state of voting in a room
type RoomStatus string

const (
	StatusWaiting  RoomStatus = "waiting"
	StatusVoting   RoomStatus = "voting"
	StatusRevealed RoomStatus = "revealed"
)

// Player represents a participant in a poker room
type Player struct {
	ID        string    `json:"id"`
	Name      string    `json:"name"`
	IsHost    bool      `json:"isHost"`
	Vote      CardValue `json:"vote,omitempty"`
	HasVoted  bool      `json:"hasVoted"`
	IsOnline  bool      `json:"isOnline"`
	JoinedAt  time.Time `json:"joinedAt"`
}

// PlayerPublic returns a public view of player (hides vote if not revealed)
func (p *Player) Public(revealed bool) map[string]interface{} {
	result := map[string]interface{}{
		"id":       p.ID,
		"name":     p.Name,
		"isHost":   p.IsHost,
		"hasVoted": p.HasVoted,
		"isOnline": p.IsOnline,
	}
	if revealed && p.HasVoted {
		result["vote"] = p.Vote
	}
	return result
}

// RoomSettings contains configuration for a room
type RoomSettings struct {
	AllowSpectators bool `json:"allowSpectators"`
	AutoReveal      bool `json:"autoReveal"`
	ShowAverage     bool `json:"showAverage"`
	Timer           *int `json:"timer,omitempty"` // seconds, nil means no timer
}

// DefaultRoomSettings returns default settings
func DefaultRoomSettings() RoomSettings {
	return RoomSettings{
		AllowSpectators: true,
		AutoReveal:      false,
		ShowAverage:     true,
		Timer:           nil,
	}
}

// Room represents a poker planning session
type Room struct {
	mu           sync.RWMutex
	ID           string       `json:"id"`
	Name         string       `json:"name"`
	HostID       string       `json:"hostId"`
	Players      []*Player    `json:"players"`
	CurrentIssue string       `json:"currentIssue,omitempty"`
	Status       RoomStatus   `json:"status"`
	Deck         []CardValue  `json:"deck"`
	Settings     RoomSettings `json:"settings"`
	CreatedAt    time.Time    `json:"createdAt"`
	LastActivity time.Time    `json:"lastActivity"`
}

// NewRoom creates a new poker room
func NewRoom(id, name, hostID string) *Room {
	return &Room{
		ID:           id,
		Name:         name,
		HostID:       hostID,
		Players:      make([]*Player, 0),
		Status:       StatusWaiting,
		Deck:         DefaultDeck(),
		Settings:     DefaultRoomSettings(),
		CreatedAt:    time.Now(),
		LastActivity: time.Now(),
	}
}

// DefaultDeck returns the standard Fibonacci deck
func DefaultDeck() []CardValue {
	return []CardValue{
		CardZero, CardHalf, CardOne, CardTwo, CardThree,
		CardFive, CardEight, CardThirteen, CardTwentyOne,
		CardQuestion, CardCoffee,
	}
}

// AddPlayer adds a player to the room
func (r *Room) AddPlayer(player *Player) {
	r.mu.Lock()
	defer r.mu.Unlock()
	r.Players = append(r.Players, player)
	r.LastActivity = time.Now()
}

// RemovePlayer removes a player from the room
func (r *Room) RemovePlayer(playerID string) *Player {
	r.mu.Lock()
	defer r.mu.Unlock()
	
	for i, p := range r.Players {
		if p.ID == playerID {
			removed := r.Players[i]
			r.Players = append(r.Players[:i], r.Players[i+1:]...)
			r.LastActivity = time.Now()
			
			// Transfer host if needed
			if removed.IsHost && len(r.Players) > 0 {
				r.Players[0].IsHost = true
				r.HostID = r.Players[0].ID
			}
			return removed
		}
	}
	return nil
}

// GetPlayer returns a player by ID
func (r *Room) GetPlayer(playerID string) *Player {
	r.mu.RLock()
	defer r.mu.RUnlock()
	
	for _, p := range r.Players {
		if p.ID == playerID {
			return p
		}
	}
	return nil
}

// SetPlayerOnline updates player online status
func (r *Room) SetPlayerOnline(playerID string, online bool) {
	r.mu.Lock()
	defer r.mu.Unlock()
	
	for _, p := range r.Players {
		if p.ID == playerID {
			p.IsOnline = online
			break
		}
	}
	r.LastActivity = time.Now()
}

// CastVote records a player's vote
func (r *Room) CastVote(playerID string, vote CardValue) bool {
	r.mu.Lock()
	defer r.mu.Unlock()
	
	if r.Status == StatusRevealed {
		return false
	}
	
	for _, p := range r.Players {
		if p.ID == playerID {
			p.Vote = vote
			p.HasVoted = true
			r.Status = StatusVoting
			r.LastActivity = time.Now()
			return true
		}
	}
	return false
}

// ClearVote clears a player's vote
func (r *Room) ClearVote(playerID string) bool {
	r.mu.Lock()
	defer r.mu.Unlock()
	
	if r.Status == StatusRevealed {
		return false
	}
	
	for _, p := range r.Players {
		if p.ID == playerID {
			p.Vote = ""
			p.HasVoted = false
			r.LastActivity = time.Now()
			return true
		}
	}
	return false
}

// AllPlayersVoted checks if all players have voted
func (r *Room) AllPlayersVoted() bool {
	r.mu.RLock()
	defer r.mu.RUnlock()
	
	if len(r.Players) == 0 {
		return false
	}
	
	for _, p := range r.Players {
		if !p.HasVoted {
			return false
		}
	}
	return true
}

// RevealVotes reveals all votes
func (r *Room) RevealVotes() {
	r.mu.Lock()
	defer r.mu.Unlock()
	r.Status = StatusRevealed
	r.LastActivity = time.Now()
}

// ResetRound resets all votes for a new round
func (r *Room) ResetRound() {
	r.mu.Lock()
	defer r.mu.Unlock()
	
	for _, p := range r.Players {
		p.Vote = ""
		p.HasVoted = false
	}
	r.Status = StatusWaiting
	r.LastActivity = time.Now()
}

// SetIssue updates the current issue
func (r *Room) SetIssue(issue string) {
	r.mu.Lock()
	defer r.mu.Unlock()
	r.CurrentIssue = issue
	r.LastActivity = time.Now()
}

// UpdateSettings updates the room settings
func (r *Room) UpdateSettings(settings RoomSettings) {
	r.mu.Lock()
	defer r.mu.Unlock()
	r.Settings = settings
}

// PublicPlayers returns public player data (thread-safe)
func (r *Room) PublicPlayers(revealed bool) []map[string]interface{} {
	r.mu.RLock()
	defer r.mu.RUnlock()

	players := make([]map[string]interface{}, len(r.Players))
	for i, p := range r.Players {
		players[i] = p.Public(revealed)
	}
	return players
}

// VotedCount returns the number of players who have voted
func (r *Room) VotedCount() int {
	r.mu.RLock()
	defer r.mu.RUnlock()
	
	count := 0
	for _, p := range r.Players {
		if p.HasVoted {
			count++
		}
	}
	return count
}

// PlayerCount returns total number of players
func (r *Room) PlayerCount() int {
	r.mu.RLock()
	defer r.mu.RUnlock()
	return len(r.Players)
}

// IsEmpty checks if room has no players
func (r *Room) IsEmpty() bool {
	r.mu.RLock()
	defer r.mu.RUnlock()
	return len(r.Players) == 0
}

// PublicState returns room state safe for broadcasting
func (r *Room) PublicState() map[string]interface{} {
	r.mu.RLock()
	defer r.mu.RUnlock()
	
	revealed := r.Status == StatusRevealed
	players := make([]map[string]interface{}, len(r.Players))
	for i, p := range r.Players {
		players[i] = p.Public(revealed)
	}
	
	state := map[string]interface{}{
		"id":           r.ID,
		"name":         r.Name,
		"hostId":       r.HostID,
		"players":      players,
		"currentIssue": r.CurrentIssue,
		"status":       r.Status,
		"deck":         r.Deck,
		"settings":     r.Settings,
		"votedCount":   r.VotedCount(),
		"playerCount":  len(r.Players),
	}
	
	// Include results if revealed
	if revealed {
		state["results"] = r.CalculateResults()
	}
	
	return state
}

// VotingResults contains calculated voting statistics
type VotingResults struct {
	Average      *float64              `json:"average"`
	Median       *float64              `json:"median"`
	Mode         CardValue             `json:"mode,omitempty"`
	Consensus    bool                  `json:"consensus"`
	Distribution map[CardValue]int     `json:"distribution"`
	TotalVotes   int                   `json:"totalVotes"`
	ValidVotes   int                   `json:"validVotes"`
}

// CalculateResults computes voting statistics
func (r *Room) CalculateResults() *VotingResults {
	r.mu.RLock()
	defer r.mu.RUnlock()
	
	distribution := make(map[CardValue]int)
	var numericVotes []float64
	
	for _, p := range r.Players {
		if p.HasVoted && p.Vote != "" {
			distribution[p.Vote]++
			if p.Vote.IsNumeric() {
				numericVotes = append(numericVotes, p.Vote.NumericValue())
			}
		}
	}
	
	totalVotes := 0
	for _, count := range distribution {
		totalVotes += count
	}
	
	results := &VotingResults{
		Distribution: distribution,
		TotalVotes:   totalVotes,
		ValidVotes:   len(numericVotes),
		Consensus:    len(distribution) == 1 && totalVotes > 0,
	}
	
	// Calculate average
	if len(numericVotes) > 0 {
		sum := 0.0
		for _, v := range numericVotes {
			sum += v
		}
		avg := sum / float64(len(numericVotes))
		results.Average = &avg
		
		// Calculate median
		sorted := make([]float64, len(numericVotes))
		copy(sorted, numericVotes)
		sortFloats(sorted)
		
		mid := len(sorted) / 2
		var median float64
		if len(sorted)%2 == 0 {
			median = (sorted[mid-1] + sorted[mid]) / 2
		} else {
			median = sorted[mid]
		}
		results.Median = &median
	}
	
	// Find mode
	maxCount := 0
	for vote, count := range distribution {
		if count > maxCount {
			maxCount = count
			results.Mode = vote
		}
	}
	
	return results
}

// Simple sort for floats
func sortFloats(s []float64) {
	for i := 0; i < len(s)-1; i++ {
		for j := 0; j < len(s)-i-1; j++ {
			if s[j] > s[j+1] {
				s[j], s[j+1] = s[j+1], s[j]
			}
		}
	}
}
