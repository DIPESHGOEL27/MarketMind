package handlers

import (
	"crypto/rand"
	"encoding/hex"
	"fmt"
	"os"
)

var JwtKey []byte

// InitHandlers initializes common configuration for handlers.
// Must be called after godotenv.Load() in main.go.
func InitHandlers() {
	secret := os.Getenv("JWT_SECRET")
	if secret == "" {
		// Generate a random 32-byte key for development
		randomBytes := make([]byte, 32)
		if _, err := rand.Read(randomBytes); err != nil {
			panic("failed to generate random JWT secret: " + err.Error())
		}
		secret = hex.EncodeToString(randomBytes)
		fmt.Println("WARNING: JWT_SECRET not set — generated random key (tokens won't persist across restarts)")
	}
	JwtKey = []byte(secret)
}
