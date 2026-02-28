package middleware

import (
	"crypto/rand"
	"fmt"
	"net/http"
	"strings"

	"marketmind-backend/models"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
)

// AuthMiddleware validates the JWT Bearer token and injects claims into context.
// Usage: r.POST("/api/news", middleware.AuthRequired(jwtKey), handlers.FetchNews)
func AuthRequired(jwtKey []byte) gin.HandlerFunc {
	return func(c *gin.Context) {
		tokenStr := strings.TrimPrefix(c.GetHeader("Authorization"), "Bearer ")
		if tokenStr == "" {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "Authorization header required"})
			return
		}

		claims := &models.Claims{}
		token, err := jwt.ParseWithClaims(tokenStr, claims, func(t *jwt.Token) (interface{}, error) {
			if _, ok := t.Method.(*jwt.SigningMethodHMAC); !ok {
				return nil, fmt.Errorf("unexpected signing method: %v", t.Header["alg"])
			}
			return jwtKey, nil
		})

		if err != nil || !token.Valid {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "Invalid or expired token"})
			return
		}

		// Store claims in context for handlers to access
		c.Set("claims", claims)
		c.Set("portfolio", claims.Portfolio)
		c.Next()
	}
}

// GetClaims retrieves the JWT claims from the Gin context (set by AuthRequired).
func GetClaims(c *gin.Context) *models.Claims {
	claims, exists := c.Get("claims")
	if !exists {
		return nil
	}
	return claims.(*models.Claims)
}

// GetPortfolio retrieves the portfolio from the Gin context.
func GetPortfolio(c *gin.Context) []string {
	portfolio, exists := c.Get("portfolio")
	if !exists {
		return []string{}
	}
	return portfolio.([]string)
}

// RequestIDMiddleware adds a unique request ID to each request for tracing.
func RequestIDMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		requestID := c.GetHeader("X-Request-ID")
		if requestID == "" {
			b := make([]byte, 8)
			rand.Read(b)
			requestID = fmt.Sprintf("%x", b)
		}
		c.Set("requestID", requestID)
		c.Header("X-Request-ID", requestID)
		c.Next()
	}
}
