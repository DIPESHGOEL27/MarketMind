package main

import (
	"context"
	"fmt"
	"log"
	"net/http"
	"os"
	"os/signal"
	"strings"
	"syscall"
	"time"

	"marketmind-backend/handlers"
	"marketmind-backend/middleware"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
)

func main() {
	// Load environment variables
	if err := godotenv.Load(); err != nil {
		fmt.Println("Warning: .env file not found, using system environment variables")
	}

	// Initialize shared handler config (JWT key, etc.) — must be after godotenv.Load()
	handlers.InitHandlers()

	r := gin.Default()

	// Global middleware
	r.Use(middleware.RequestIDMiddleware())

	// CORS Configuration — configurable via CORS_ORIGINS env var
	allowedOrigins := []string{"http://localhost:3000"}
	if origins := os.Getenv("CORS_ORIGINS"); origins != "" {
		allowedOrigins = strings.Split(origins, ",")
	}

	r.Use(cors.New(cors.Config{
		AllowOrigins:     allowedOrigins,
		AllowMethods:     []string{"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Accept", "Authorization"},
		ExposeHeaders:    []string{"Content-Length", "X-Request-ID"},
		AllowCredentials: true,
		MaxAge:           12 * time.Hour,
	}))

	// Health check (unauthenticated)
	r.GET("/health", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{
			"status":  "healthy",
			"service": "marketmind-backend",
			"time":    time.Now().UTC().Format(time.RFC3339),
		})
	})

	// Public endpoints (no auth required)
	r.GET("/api/quotes", handlers.FetchFinnhubQuotes)
	r.GET("/api/market-indices", handlers.FetchMarketIndices)
	r.GET("/api/market-sentiment", handlers.PredictMarketSentiment)
	r.GET("/api/market-news", handlers.FetchMarketNews)
	r.GET("/api/search-tickers", handlers.SearchTickers)

	// Authenticated endpoints
	auth := r.Group("/api")
	auth.Use(middleware.AuthRequired(handlers.JwtKey))
	{
		auth.GET("/news", handlers.FetchNewsHybrid)
		auth.POST("/analyze-ticker", handlers.AnalyzeTicker)
	}

	// Portfolio (returns new JWT, so auth is optional for initial creation)
	r.POST("/api/user/update-portfolio", handlers.UpdatePortfolio)

	// WebSocket
	r.GET("/ws", handlers.HandleWebSocket)

	// Start background services
	go handlers.BroadcastNewsLoop()

	// Graceful shutdown
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	srv := &http.Server{
		Addr:         ":" + port,
		Handler:      r,
		ReadTimeout:  15 * time.Second,
		WriteTimeout: 60 * time.Second,
		IdleTimeout:  120 * time.Second,
	}

	go func() {
		fmt.Printf("MarketMind backend starting on :%s\n", port)
		if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			log.Fatalf("Server failed: %v", err)
		}
	}()

	// Wait for interrupt signal
	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	<-quit
	fmt.Println("\nShutdown signal received, draining connections...")

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	if err := srv.Shutdown(ctx); err != nil {
		log.Fatalf("Server forced to shutdown: %v", err)
	}
	fmt.Println("Server exited gracefully")
}
