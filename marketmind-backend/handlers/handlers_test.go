package handlers

import (
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"
	"time"

	"marketmind-backend/models"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
)

func init() {
	gin.SetMode(gin.TestMode)
	JwtKey = []byte("test-secret-key-for-testing")
}

func createTestToken(portfolio []string) string {
	claims := &models.Claims{
		Portfolio: portfolio,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(1 * time.Hour)),
		},
	}
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	tokenString, _ := token.SignedString(JwtKey)
	return tokenString
}

func TestSearchTickers(t *testing.T) {
	r := gin.New()
	r.GET("/api/search-tickers", SearchTickers)

	tests := []struct {
		name     string
		query    string
		wantCode int
		wantMin  int // minimum number of results expected
	}{
		{"search for AAPL", "AAPL", 200, 1},
		{"search for AA prefix", "AA", 200, 1},
		{"empty query", "", 200, 0},
		{"no match", "ZZZZZ", 200, 0},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			req := httptest.NewRequest("GET", "/api/search-tickers?q="+tt.query, nil)
			w := httptest.NewRecorder()
			r.ServeHTTP(w, req)

			if w.Code != tt.wantCode {
				t.Errorf("expected status %d, got %d", tt.wantCode, w.Code)
			}

			var results []string
			if err := json.Unmarshal(w.Body.Bytes(), &results); err != nil {
				t.Fatalf("failed to parse response: %v", err)
			}

			if len(results) < tt.wantMin {
				t.Errorf("expected at least %d results, got %d", tt.wantMin, len(results))
			}
		})
	}
}

func TestUpdatePortfolio(t *testing.T) {
	r := gin.New()
	r.POST("/api/user/update-portfolio", UpdatePortfolio)

	body := `{"portfolio": ["AAPL", "GOOGL", "MSFT"]}`
	req := httptest.NewRequest("POST", "/api/user/update-portfolio", strings.NewReader(body))
	req.Header.Set("Content-Type", "application/json")
	w := httptest.NewRecorder()
	r.ServeHTTP(w, req)

	if w.Code != http.StatusOK {
		t.Errorf("expected 200, got %d: %s", w.Code, w.Body.String())
	}

	var resp map[string]string
	if err := json.Unmarshal(w.Body.Bytes(), &resp); err != nil {
		t.Fatalf("failed to parse response: %v", err)
	}

	tokenStr, ok := resp["token"]
	if !ok || tokenStr == "" {
		t.Fatal("expected 'token' in response")
	}

	// Verify the token contains the right portfolio
	claims := &models.Claims{}
	_, err := jwt.ParseWithClaims(tokenStr, claims, func(t *jwt.Token) (interface{}, error) {
		return JwtKey, nil
	})
	if err != nil {
		t.Fatalf("failed to parse returned token: %v", err)
	}

	if len(claims.Portfolio) != 3 {
		t.Errorf("expected 3 tickers in portfolio, got %d", len(claims.Portfolio))
	}
}

func TestUpdatePortfolio_InvalidBody(t *testing.T) {
	r := gin.New()
	r.POST("/api/user/update-portfolio", UpdatePortfolio)

	req := httptest.NewRequest("POST", "/api/user/update-portfolio", strings.NewReader("invalid"))
	req.Header.Set("Content-Type", "application/json")
	w := httptest.NewRecorder()
	r.ServeHTTP(w, req)

	if w.Code != http.StatusBadRequest {
		t.Errorf("expected 400 for invalid body, got %d", w.Code)
	}
}

func TestFetchFinnhubQuotes_NoTickers(t *testing.T) {
	r := gin.New()
	r.GET("/api/quotes", FetchFinnhubQuotes)

	req := httptest.NewRequest("GET", "/api/quotes", nil)
	w := httptest.NewRecorder()
	r.ServeHTTP(w, req)

	if w.Code != http.StatusBadRequest {
		t.Errorf("expected 400 when tickers missing, got %d", w.Code)
	}
}

func TestAnalyzeTicker_InvalidBody(t *testing.T) {
	r := gin.New()
	r.POST("/api/analyze-ticker", AnalyzeTicker)

	req := httptest.NewRequest("POST", "/api/analyze-ticker", strings.NewReader("invalid"))
	req.Header.Set("Content-Type", "application/json")
	w := httptest.NewRecorder()
	r.ServeHTTP(w, req)

	if w.Code != http.StatusBadRequest {
		t.Errorf("expected 400 for invalid body, got %d", w.Code)
	}
}

func TestAnalyzeTicker_EmptyTicker(t *testing.T) {
	r := gin.New()
	r.POST("/api/analyze-ticker", AnalyzeTicker)

	req := httptest.NewRequest("POST", "/api/analyze-ticker", strings.NewReader(`{"ticker": ""}`))
	req.Header.Set("Content-Type", "application/json")
	w := httptest.NewRecorder()
	r.ServeHTTP(w, req)

	if w.Code != http.StatusBadRequest {
		t.Errorf("expected 400 for empty ticker, got %d", w.Code)
	}
}

func TestFetchNews_NoAuth(t *testing.T) {
	r := gin.New()
	r.GET("/api/news", FetchNews)

	req := httptest.NewRequest("GET", "/api/news", nil)
	w := httptest.NewRecorder()
	r.ServeHTTP(w, req)

	if w.Code != http.StatusUnauthorized {
		t.Errorf("expected 401 without auth, got %d", w.Code)
	}
}

func TestFetchMarketNews(t *testing.T) {
	r := gin.New()
	r.GET("/api/market-news", FetchMarketNews)

	req := httptest.NewRequest("GET", "/api/market-news", nil)
	w := httptest.NewRecorder()
	r.ServeHTTP(w, req)

	if w.Code != http.StatusOK {
		t.Errorf("expected 200, got %d", w.Code)
	}

	var resp map[string]interface{}
	if err := json.Unmarshal(w.Body.Bytes(), &resp); err != nil {
		t.Fatalf("failed to parse response: %v", err)
	}

	if _, ok := resp["summary"]; !ok {
		t.Error("expected 'summary' field in response")
	}
}
