package handlers

import (
	"encoding/json"
	"log"
	"strings"

	"github.com/fasthttp/websocket"
	"github.com/google/uuid"
	"github.com/valyala/fasthttp"

	"github.com/scrum-poker/backend/internal/room"
	ws "github.com/scrum-poker/backend/internal/websocket"
)

// Handler contains HTTP handlers
type Handler struct {
	roomManager    *room.Manager
	wsHub          *ws.Hub
	upgrader       websocket.FastHTTPUpgrader
	allowedOrigins []string
}

// NewHandler creates a new handler
func NewHandler(roomManager *room.Manager, wsHub *ws.Hub, allowedOrigins []string) *Handler {
	return &Handler{
		roomManager:    roomManager,
		wsHub:          wsHub,
		allowedOrigins: allowedOrigins,
		upgrader: websocket.FastHTTPUpgrader{
			ReadBufferSize:  1024,
			WriteBufferSize: 1024,
			CheckOrigin: func(ctx *fasthttp.RequestCtx) bool {
				return true
			},
		},
	}
}

// Router is the main request router
func (h *Handler) Router(ctx *fasthttp.RequestCtx) {
	path := string(ctx.Path())
	method := string(ctx.Method())

	// CORS handling
	h.setCORSHeaders(ctx)
	if method == "OPTIONS" {
		ctx.SetStatusCode(fasthttp.StatusNoContent)
		return
	}

	// Route matching
	switch {
	case path == "/health" && method == "GET":
		h.Health(ctx)
	case path == "/ws" && method == "GET":
		h.WebSocket(ctx)
	case path == "/api/rooms" && method == "POST":
		h.CreateRoom(ctx)
	case path == "/api/rooms" && method == "GET":
		h.ListRooms(ctx)
	case path == "/api/cards" && method == "GET":
		h.ValidCards(ctx)
	case path == "/api/stats" && method == "GET":
		h.Stats(ctx)
	case strings.HasPrefix(path, "/api/rooms/"):
		h.routeRoomEndpoints(ctx, path, method)
	default:
		errorResponse(ctx, fasthttp.StatusNotFound, "not_found", "Endpoint not found")
	}
}

// routeRoomEndpoints handles /api/rooms/{roomId}/* routes
func (h *Handler) routeRoomEndpoints(ctx *fasthttp.RequestCtx, path, method string) {
	// Strip /api/rooms/ prefix
	rest := strings.TrimPrefix(path, "/api/rooms/")
	parts := strings.SplitN(rest, "/", 2)
	roomID := parts[0]

	if roomID == "" {
		errorResponse(ctx, fasthttp.StatusBadRequest, "invalid_request", "Room ID is required")
		return
	}

	// Store roomId for handlers
	ctx.SetUserValue("roomId", roomID)

	if len(parts) == 1 {
		// /api/rooms/{roomId}
		if method == "GET" {
			h.GetRoom(ctx)
		} else {
			ctx.SetStatusCode(fasthttp.StatusMethodNotAllowed)
		}
		return
	}

	subpath := parts[1]
	switch {
	case subpath == "check" && method == "GET":
		h.CheckRoom(ctx)
	case subpath == "join" && method == "POST":
		h.JoinRoom(ctx)
	default:
		errorResponse(ctx, fasthttp.StatusNotFound, "not_found", "Endpoint not found")
	}
}

// setCORSHeaders adds CORS headers to the response
func (h *Handler) setCORSHeaders(ctx *fasthttp.RequestCtx) {
	origin := string(ctx.Request.Header.Peek("Origin"))
	if origin == "" {
		origin = "*"
	}

	allowed := false
	for _, o := range h.allowedOrigins {
		if strings.TrimSpace(o) == "*" || strings.TrimSpace(o) == origin {
			allowed = true
			break
		}
	}

	if allowed {
		ctx.Response.Header.Set("Access-Control-Allow-Origin", origin)
	}

	ctx.Response.Header.Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
	ctx.Response.Header.Set("Access-Control-Allow-Headers", "Accept, Authorization, Content-Type, X-Request-ID")
	ctx.Response.Header.Set("Access-Control-Expose-Headers", "Link")
	ctx.Response.Header.Set("Access-Control-Allow-Credentials", "true")
	ctx.Response.Header.Set("Access-Control-Max-Age", "300")
}

// Response helpers
func jsonResponse(ctx *fasthttp.RequestCtx, status int, data interface{}) {
	ctx.SetContentType("application/json")
	ctx.SetStatusCode(status)
	if err := json.NewEncoder(ctx).Encode(data); err != nil {
		log.Printf("Failed to encode JSON response: %v", err)
	}
}

func errorResponse(ctx *fasthttp.RequestCtx, status int, code, message string) {
	jsonResponse(ctx, status, map[string]interface{}{
		"error": map[string]string{
			"code":    code,
			"message": message,
		},
	})
}

// CreateRoomRequest represents room creation request
type CreateRoomRequest struct {
	Name     string `json:"name"`
	HostName string `json:"hostName"`
}

// CreateRoomResponse represents room creation response
type CreateRoomResponse struct {
	Room     map[string]interface{} `json:"room"`
	PlayerID string                 `json:"playerId"`
}

// CreateRoom handles POST /api/rooms
func (h *Handler) CreateRoom(ctx *fasthttp.RequestCtx) {
	var req CreateRoomRequest
	if err := json.Unmarshal(ctx.PostBody(), &req); err != nil {
		errorResponse(ctx, fasthttp.StatusBadRequest, "invalid_request", "Invalid request body")
		return
	}

	if req.HostName == "" {
		errorResponse(ctx, fasthttp.StatusBadRequest, "validation_error", "Host name is required")
		return
	}

	if req.Name == "" {
		req.Name = "Planning Session"
	}

	hostID := uuid.New().String()
	room, _ := h.roomManager.CreateRoom(req.Name, hostID, req.HostName)

	jsonResponse(ctx, fasthttp.StatusCreated, CreateRoomResponse{
		Room:     room.PublicState(),
		PlayerID: hostID,
	})
}

// GetRoom handles GET /api/rooms/{roomId}
func (h *Handler) GetRoom(ctx *fasthttp.RequestCtx) {
	roomID := ctx.UserValue("roomId").(string)

	room := h.roomManager.GetRoom(roomID)
	if room == nil {
		errorResponse(ctx, fasthttp.StatusNotFound, "room_not_found", "Room not found")
		return
	}

	jsonResponse(ctx, fasthttp.StatusOK, map[string]interface{}{
		"room": room.PublicState(),
	})
}

// CheckRoom handles GET /api/rooms/{roomId}/check
func (h *Handler) CheckRoom(ctx *fasthttp.RequestCtx) {
	roomID := ctx.UserValue("roomId").(string)

	exists := h.roomManager.RoomExists(roomID)

	jsonResponse(ctx, fasthttp.StatusOK, map[string]interface{}{
		"exists": exists,
		"roomId": roomID,
	})
}

// JoinRoomRequest represents room join request
type JoinRoomRequest struct {
	PlayerName string `json:"playerName"`
	PlayerID   string `json:"playerId,omitempty"`
}

// JoinRoom handles POST /api/rooms/{roomId}/join
func (h *Handler) JoinRoom(ctx *fasthttp.RequestCtx) {
	roomID := ctx.UserValue("roomId").(string)

	var req JoinRoomRequest
	if err := json.Unmarshal(ctx.PostBody(), &req); err != nil {
		errorResponse(ctx, fasthttp.StatusBadRequest, "invalid_request", "Invalid request body")
		return
	}

	if req.PlayerName == "" {
		errorResponse(ctx, fasthttp.StatusBadRequest, "validation_error", "Player name is required")
		return
	}

	playerID := req.PlayerID
	if playerID == "" {
		playerID = uuid.New().String()
	}

	room, player, err := h.roomManager.JoinRoom(roomID, playerID, req.PlayerName)
	if err != nil {
		errorResponse(ctx, fasthttp.StatusNotFound, "room_not_found", err.Error())
		return
	}

	jsonResponse(ctx, fasthttp.StatusOK, map[string]interface{}{
		"room":     room.PublicState(),
		"playerId": player.ID,
	})
}

// WebSocket handles WebSocket upgrade
func (h *Handler) WebSocket(ctx *fasthttp.RequestCtx) {
	err := h.upgrader.Upgrade(ctx, func(conn *websocket.Conn) {
		client := ws.NewClient(h.wsHub, conn)
		h.wsHub.RegisterClient(client)

		go client.WritePump()
		client.ReadPump() // blocks until connection closes
	})
	if err != nil {
		log.Printf("WebSocket upgrade error: %v", err)
	}
}

// Health handles GET /health
func (h *Handler) Health(ctx *fasthttp.RequestCtx) {
	jsonResponse(ctx, fasthttp.StatusOK, map[string]interface{}{
		"status":      "healthy",
		"rooms":       h.roomManager.GetRoomCount(),
		"players":     h.roomManager.GetPlayerCount(),
		"connections": h.wsHub.GetTotalClients(),
	})
}

// Stats handles GET /api/stats
func (h *Handler) Stats(ctx *fasthttp.RequestCtx) {
	jsonResponse(ctx, fasthttp.StatusOK, map[string]interface{}{
		"rooms":       h.roomManager.GetRoomCount(),
		"players":     h.roomManager.GetPlayerCount(),
		"connections": h.wsHub.GetTotalClients(),
	})
}

// ListRooms handles GET /api/rooms (admin/debug endpoint)
func (h *Handler) ListRooms(ctx *fasthttp.RequestCtx) {
	jsonResponse(ctx, fasthttp.StatusOK, map[string]interface{}{
		"rooms": h.roomManager.ListRooms(),
	})
}

// ValidCards handles GET /api/cards
func (h *Handler) ValidCards(ctx *fasthttp.RequestCtx) {
	cards := []map[string]interface{}{
		{"value": "0", "label": "0", "numericValue": 0},
		{"value": "½", "label": "½", "numericValue": 0.5},
		{"value": "1", "label": "1", "numericValue": 1},
		{"value": "2", "label": "2", "numericValue": 2},
		{"value": "3", "label": "3", "numericValue": 3},
		{"value": "5", "label": "5", "numericValue": 5},
		{"value": "8", "label": "8", "numericValue": 8},
		{"value": "13", "label": "13", "numericValue": 13},
		{"value": "21", "label": "21", "numericValue": 21},
		{"value": "34", "label": "34", "numericValue": 34},
		{"value": "55", "label": "55", "numericValue": 55},
		{"value": "89", "label": "89", "numericValue": 89},
		{"value": "?", "label": "?", "numericValue": nil},
		{"value": "☕", "label": "☕", "numericValue": nil},
	}

	jsonResponse(ctx, fasthttp.StatusOK, map[string]interface{}{
		"cards": cards,
	})
}
