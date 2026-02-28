package handlers

import (
	"log"
	"net/http"
	"sync"
	"time"

	"marketmind-backend/models"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
	"github.com/gorilla/websocket"
)

var (
	// SafeWsClients protects the map of connected clients
	SafeWsClients = struct {
		sync.RWMutex
		Clients map[*websocket.Conn][]string
	}{
		Clients: make(map[*websocket.Conn][]string),
	}
	wsUpgrader = websocket.Upgrader{CheckOrigin: func(r *http.Request) bool { return true }}
)

// HandleWebSocket manages new WebSocket connections
func HandleWebSocket(c *gin.Context) {
	conn, err := wsUpgrader.Upgrade(c.Writer, c.Request, nil)
	if err != nil {
		log.Println("WebSocket upgrade error:", err)
		return
	}

	token := c.Query("token")
	claims := &models.Claims{}
	_, err = jwt.ParseWithClaims(token, claims, func(t *jwt.Token) (interface{}, error) {
		return JwtKey, nil
	})
	if err != nil {
		conn.Close()
		return
	}

	SafeWsClients.Lock()
	SafeWsClients.Clients[conn] = claims.Portfolio
	SafeWsClients.Unlock()
}

// BroadcastNewsLoop continuously sends updates to connected clients
func BroadcastNewsLoop() {
	for {
		SafeWsClients.RLock()
		// Copy clients to avoid holding lock during network operations
		clientsCopy := make(map[*websocket.Conn][]string, len(SafeWsClients.Clients))
		for k, v := range SafeWsClients.Clients {
			clientsCopy[k] = v
		}
		SafeWsClients.RUnlock()

		for conn, portfolio := range clientsCopy {
			news := []models.NewsItem{}
			for _, ticker := range portfolio {
				item := GetNewsItemFromGemini(ticker)
				if item.Ticker == "" {
					item.Ticker = ticker
				}
				item.Date = time.Now().Format("2006-01-02")
				news = append(news, item)
			}
			err := conn.WriteJSON(news)
			if err != nil {
				log.Println("WS write error, removing client:", err)
				conn.Close()
				SafeWsClients.Lock()
				delete(SafeWsClients.Clients, conn)
				SafeWsClients.Unlock()
			}
		}
		time.Sleep(60 * time.Second)
	}
}
