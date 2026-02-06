package room

import (
	"crypto/rand"
	"fmt"
	"log"
	"sync"
	"time"

	"github.com/scrum-poker/backend/internal/models"
)

// Manager handles room lifecycle and storage
type Manager struct {
	mu       sync.RWMutex
	rooms    map[string]*models.Room
	cleanup  time.Duration
	stopChan chan struct{}
}

// NewManager creates a new room manager
func NewManager(cleanupInterval time.Duration) *Manager {
	m := &Manager{
		rooms:    make(map[string]*models.Room),
		cleanup:  cleanupInterval,
		stopChan: make(chan struct{}),
	}

	// Start cleanup goroutine
	go m.cleanupRoutine()

	return m
}

// CreateRoom creates a new room with generated ID
func (m *Manager) CreateRoom(name, hostID, hostName string) (*models.Room, *models.Player) {
	m.mu.Lock()
	defer m.mu.Unlock()

	roomID := m.generateRoomCode()
	room := models.NewRoom(roomID, name, hostID)

	// Create host player
	host := &models.Player{
		ID:       hostID,
		Name:     hostName,
		IsHost:   true,
		IsOnline: true,
		JoinedAt: time.Now(),
	}
	room.AddPlayer(host)

	m.rooms[roomID] = room
	log.Printf("Room created: %s (%s) by %s", roomID, name, hostName)

	return room, host
}

// GetRoom returns a room by ID
func (m *Manager) GetRoom(roomID string) *models.Room {
	m.mu.RLock()
	defer m.mu.RUnlock()
	return m.rooms[roomID]
}

// JoinRoom adds a player to an existing room
func (m *Manager) JoinRoom(roomID, playerID, playerName string) (*models.Room, *models.Player, error) {
	m.mu.Lock()
	defer m.mu.Unlock()

	room, exists := m.rooms[roomID]
	if !exists {
		return nil, nil, fmt.Errorf("room not found: %s", roomID)
	}

	// Check if player already exists (reconnection)
	if existing := room.GetPlayer(playerID); existing != nil {
		existing.IsOnline = true
		log.Printf("Player reconnected: %s to room %s", playerName, roomID)
		return room, existing, nil
	}

	// Create new player
	player := &models.Player{
		ID:       playerID,
		Name:     playerName,
		IsHost:   false,
		IsOnline: true,
		JoinedAt: time.Now(),
	}
	room.AddPlayer(player)

	log.Printf("Player joined: %s to room %s", playerName, roomID)
	return room, player, nil
}

// LeaveRoom removes a player from a room
func (m *Manager) LeaveRoom(roomID, playerID string) (*models.Player, bool) {
	m.mu.Lock()
	defer m.mu.Unlock()

	room, exists := m.rooms[roomID]
	if !exists {
		return nil, false
	}

	player := room.RemovePlayer(playerID)
	if player == nil {
		return nil, false
	}

	log.Printf("Player left: %s from room %s", player.Name, roomID)

	// Check if room is empty
	if room.IsEmpty() {
		delete(m.rooms, roomID)
		log.Printf("Room deleted (empty): %s", roomID)
		return player, true
	}

	return player, false
}

// DeleteRoom removes a room
func (m *Manager) DeleteRoom(roomID string) {
	m.mu.Lock()
	defer m.mu.Unlock()
	delete(m.rooms, roomID)
	log.Printf("Room deleted: %s", roomID)
}

// RoomExists checks if a room exists
func (m *Manager) RoomExists(roomID string) bool {
	m.mu.RLock()
	defer m.mu.RUnlock()
	_, exists := m.rooms[roomID]
	return exists
}

// GetRoomCount returns the number of active rooms
func (m *Manager) GetRoomCount() int {
	m.mu.RLock()
	defer m.mu.RUnlock()
	return len(m.rooms)
}

// GetPlayerCount returns total players across all rooms
func (m *Manager) GetPlayerCount() int {
	m.mu.RLock()
	defer m.mu.RUnlock()

	count := 0
	for _, room := range m.rooms {
		count += room.PlayerCount()
	}
	return count
}

// ListRooms returns a summary of all rooms (for admin/debug)
func (m *Manager) ListRooms() []map[string]interface{} {
	m.mu.RLock()
	defer m.mu.RUnlock()

	rooms := make([]map[string]interface{}, 0, len(m.rooms))
	for _, room := range m.rooms {
		rooms = append(rooms, map[string]interface{}{
			"id":           room.ID,
			"name":         room.Name,
			"playerCount":  room.PlayerCount(),
			"status":       room.Status,
			"createdAt":    room.CreatedAt,
			"lastActivity": room.LastActivity,
		})
	}
	return rooms
}

// generateRoomCode creates a unique 6-character room code
func (m *Manager) generateRoomCode() string {
	const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"
	const codeLen = 6

	for range 100 {
		b := make([]byte, codeLen)
		_, _ = rand.Read(b)

		code := make([]byte, codeLen)
		for i := range code {
			code[i] = chars[int(b[i])%len(chars)]
		}

		roomCode := string(code)
		if _, exists := m.rooms[roomCode]; !exists {
			return roomCode
		}
	}

	// Fallback: use timestamp-based code
	return fmt.Sprintf("%06d", time.Now().UnixNano()%1000000)
}

// cleanupRoutine periodically removes inactive rooms
func (m *Manager) cleanupRoutine() {
	ticker := time.NewTicker(m.cleanup)
	defer ticker.Stop()

	for {
		select {
		case <-ticker.C:
			m.cleanupInactiveRooms()
		case <-m.stopChan:
			return
		}
	}
}

// cleanupInactiveRooms removes rooms that have been inactive for too long
func (m *Manager) cleanupInactiveRooms() {
	m.mu.Lock()
	defer m.mu.Unlock()

	threshold := time.Now().Add(-2 * time.Hour) // 2 hours inactivity

	for id, room := range m.rooms {
		if room.LastActivity.Before(threshold) || room.IsEmpty() {
			delete(m.rooms, id)
			log.Printf("Room cleaned up (inactive): %s", id)
		}
	}
}

// Stop stops the manager and cleanup routine
func (m *Manager) Stop() {
	close(m.stopChan)
}
