package main

import (
	"log"
	"os"
	"os/signal"
	"strings"
	"syscall"
	"time"

	"github.com/valyala/fasthttp"

	"github.com/scrum-poker/backend/internal/handlers"
	"github.com/scrum-poker/backend/internal/room"
	"github.com/scrum-poker/backend/internal/websocket"
)

func main() {
	// Configuration
	port := getEnv("PORT", "8080")
	allowedOrigins := getEnv("ALLOWED_ORIGINS", "*")

	// Initialize room manager
	roomManager := room.NewManager(5 * time.Minute)

	// Initialize WebSocket hub
	wsHub := websocket.NewHub(roomManager)
	go wsHub.Run()

	// Initialize handlers
	handler := handlers.NewHandler(roomManager, wsHub, strings.Split(allowedOrigins, ","))

	// Create server
	server := &fasthttp.Server{
		Handler:          handler.Router,
		ReadTimeout:      15 * time.Second,
		WriteTimeout:     15 * time.Second,
		IdleTimeout:      60 * time.Second,
		MaxRequestBodySize: 1 * 1024 * 1024, // 1MB
		Name:             "ScrumPoker",
	}

	// Start server in goroutine
	go func() {
		log.Printf("Scrum Poker server starting on port %s", port)
		log.Printf("WebSocket endpoint: ws://localhost:%s/ws", port)
		log.Printf("API endpoint: http://localhost:%s/api", port)

		if err := server.ListenAndServe(":" + port); err != nil {
			log.Fatalf("Server error: %v", err)
		}
	}()

	// Graceful shutdown
	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	<-quit

	log.Println("Shutting down server...")

	// Stop room manager cleanup
	roomManager.Stop()

	if err := server.Shutdown(); err != nil {
		log.Fatalf("Server forced to shutdown: %v", err)
	}

	log.Println("Server stopped")
}

func getEnv(key, defaultValue string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return defaultValue
}
