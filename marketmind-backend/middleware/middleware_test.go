package middleware

import (
	"net/http"
	"net/http/httptest"
	"testing"
	"time"

	"marketmind-backend/models"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
)

func init() {
	gin.SetMode(gin.TestMode)
}

var testKey = []byte("test-secret-key")

func createToken(portfolio []string, key []byte) string {
	claims := &models.Claims{
		Portfolio: portfolio,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(1 * time.Hour)),
		},
	}
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	tokenString, _ := token.SignedString(key)
	return tokenString
}

func TestAuthRequired_ValidToken(t *testing.T) {
	r := gin.New()
	r.GET("/test", AuthRequired(testKey), func(c *gin.Context) {
		portfolio := GetPortfolio(c)
		claims := GetClaims(c)
		if claims == nil {
			t.Error("expected claims in context")
		}
		if len(portfolio) != 2 {
			t.Errorf("expected 2 tickers, got %d", len(portfolio))
		}
		c.JSON(200, gin.H{"ok": true})
	})

	token := createToken([]string{"AAPL", "GOOGL"}, testKey)
	req := httptest.NewRequest("GET", "/test", nil)
	req.Header.Set("Authorization", "Bearer "+token)
	w := httptest.NewRecorder()
	r.ServeHTTP(w, req)

	if w.Code != 200 {
		t.Errorf("expected 200, got %d: %s", w.Code, w.Body.String())
	}
}

func TestAuthRequired_NoToken(t *testing.T) {
	r := gin.New()
	r.GET("/test", AuthRequired(testKey), func(c *gin.Context) {
		c.JSON(200, gin.H{"ok": true})
	})

	req := httptest.NewRequest("GET", "/test", nil)
	w := httptest.NewRecorder()
	r.ServeHTTP(w, req)

	if w.Code != http.StatusUnauthorized {
		t.Errorf("expected 401, got %d", w.Code)
	}
}

func TestAuthRequired_InvalidToken(t *testing.T) {
	r := gin.New()
	r.GET("/test", AuthRequired(testKey), func(c *gin.Context) {
		c.JSON(200, gin.H{"ok": true})
	})

	req := httptest.NewRequest("GET", "/test", nil)
	req.Header.Set("Authorization", "Bearer invalid-token")
	w := httptest.NewRecorder()
	r.ServeHTTP(w, req)

	if w.Code != http.StatusUnauthorized {
		t.Errorf("expected 401, got %d", w.Code)
	}
}

func TestAuthRequired_ExpiredToken(t *testing.T) {
	r := gin.New()
	r.GET("/test", AuthRequired(testKey), func(c *gin.Context) {
		c.JSON(200, gin.H{"ok": true})
	})

	// Create an already-expired token
	claims := &models.Claims{
		Portfolio: []string{"AAPL"},
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(-1 * time.Hour)),
		},
	}
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	tokenString, _ := token.SignedString(testKey)

	req := httptest.NewRequest("GET", "/test", nil)
	req.Header.Set("Authorization", "Bearer "+tokenString)
	w := httptest.NewRecorder()
	r.ServeHTTP(w, req)

	if w.Code != http.StatusUnauthorized {
		t.Errorf("expected 401 for expired token, got %d", w.Code)
	}
}

func TestAuthRequired_WrongKey(t *testing.T) {
	r := gin.New()
	r.GET("/test", AuthRequired(testKey), func(c *gin.Context) {
		c.JSON(200, gin.H{"ok": true})
	})

	// Sign with different key
	wrongKey := []byte("wrong-key")
	token := createToken([]string{"AAPL"}, wrongKey)

	req := httptest.NewRequest("GET", "/test", nil)
	req.Header.Set("Authorization", "Bearer "+token)
	w := httptest.NewRecorder()
	r.ServeHTTP(w, req)

	if w.Code != http.StatusUnauthorized {
		t.Errorf("expected 401 for wrong key, got %d", w.Code)
	}
}

func TestRequestIDMiddleware_GeneratesID(t *testing.T) {
	r := gin.New()
	r.Use(RequestIDMiddleware())
	r.GET("/test", func(c *gin.Context) {
		c.JSON(200, gin.H{"ok": true})
	})

	req := httptest.NewRequest("GET", "/test", nil)
	w := httptest.NewRecorder()
	r.ServeHTTP(w, req)

	requestID := w.Header().Get("X-Request-ID")
	if requestID == "" {
		t.Error("expected X-Request-ID header to be set")
	}
}

func TestRequestIDMiddleware_PreservesExistingID(t *testing.T) {
	r := gin.New()
	r.Use(RequestIDMiddleware())
	r.GET("/test", func(c *gin.Context) {
		c.JSON(200, gin.H{"ok": true})
	})

	req := httptest.NewRequest("GET", "/test", nil)
	req.Header.Set("X-Request-ID", "existing-id-123")
	w := httptest.NewRecorder()
	r.ServeHTTP(w, req)

	requestID := w.Header().Get("X-Request-ID")
	if requestID != "existing-id-123" {
		t.Errorf("expected existing-id-123, got %s", requestID)
	}
}

func TestGetClaims_NoContext(t *testing.T) {
	r := gin.New()
	r.GET("/test", func(c *gin.Context) {
		claims := GetClaims(c)
		if claims != nil {
			t.Error("expected nil claims without auth middleware")
		}
		c.JSON(200, gin.H{"ok": true})
	})

	req := httptest.NewRequest("GET", "/test", nil)
	w := httptest.NewRecorder()
	r.ServeHTTP(w, req)
}

func TestGetPortfolio_NoContext(t *testing.T) {
	r := gin.New()
	r.GET("/test", func(c *gin.Context) {
		portfolio := GetPortfolio(c)
		if len(portfolio) != 0 {
			t.Error("expected empty portfolio without auth middleware")
		}
		c.JSON(200, gin.H{"ok": true})
	})

	req := httptest.NewRequest("GET", "/test", nil)
	w := httptest.NewRecorder()
	r.ServeHTTP(w, req)
}
