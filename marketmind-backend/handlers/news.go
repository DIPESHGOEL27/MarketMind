package handlers

import (
	"encoding/json"
	"net/http"
	"os"
	"strings"
	"time"

	"marketmind-backend/models"
	"marketmind-backend/services"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
)

// Caches with proper TTLs
var (
	summaryCacheSvc    = services.NewTTLCache[models.NewsItem](10 * time.Minute)
	marketNewsCacheSvc = services.NewTTLCache[string](15 * time.Minute)
)

// Ticker data loaded from JSON file
var allTickers []TickerInfo

type TickerInfo struct {
	Symbol string `json:"symbol"`
	Name   string `json:"name"`
}

func init() {
	loadTickers()
}

func loadTickers() {
	// Try loading from public/tickers.json (frontend ships it)
	paths := []string{
		"../marketmind-frontend/public/tickers.json",
		"tickers.json",
	}
	for _, path := range paths {
		data, err := os.ReadFile(path)
		if err != nil {
			continue
		}
		// Try as array of objects first
		var tickers []TickerInfo
		if err := json.Unmarshal(data, &tickers); err == nil && len(tickers) > 0 {
			allTickers = tickers
			return
		}
		// Try as array of strings
		var symbols []string
		if err := json.Unmarshal(data, &symbols); err == nil {
			for _, s := range symbols {
				allTickers = append(allTickers, TickerInfo{Symbol: s, Name: ""})
			}
			return
		}
	}

	// Fallback: common tickers if no file found
	defaults := []string{
		"AAPL", "GOOGL", "MSFT", "TSLA", "AMZN", "META", "NVDA", "NFLX", "JPM",
		"V", "WMT", "DIS", "PYPL", "INTC", "AMD", "CRM", "ORCL", "CSCO", "QCOM", "ADBE",
		"BA", "GS", "MS", "C", "PFE", "JNJ", "UNH", "MRK", "ABBV", "KO", "PEP",
	}
	for _, s := range defaults {
		allTickers = append(allTickers, TickerInfo{Symbol: s, Name: ""})
	}
}

func FetchNews(c *gin.Context) {
	tokenStr := strings.TrimPrefix(c.GetHeader("Authorization"), "Bearer ")
	claims := &models.Claims{}
	_, err := jwt.ParseWithClaims(tokenStr, claims, func(t *jwt.Token) (interface{}, error) {
		return JwtKey, nil
	})
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid token"})
		return
	}

	if len(claims.Portfolio) == 0 {
		c.JSON(http.StatusOK, []models.NewsItem{})
		return
	}

	// Limit portfolio size to prevent abuse
	portfolio := claims.Portfolio
	if len(portfolio) > 20 {
		portfolio = portfolio[:20]
	}

	news := []models.NewsItem{}
	for _, ticker := range portfolio {
		item := GetNewsItemFromGemini(ticker)
		if item.Ticker == "" {
			item.Ticker = ticker
		}
		item.Date = time.Now().Format("2006-01-02")
		news = append(news, item)
	}
	c.JSON(http.StatusOK, news)
}

func FetchMarketNews(c *gin.Context) {
	// Check cache
	if cached, ok := marketNewsCacheSvc.Get("market"); ok {
		c.JSON(http.StatusOK, gin.H{"summary": cached, "updated": time.Now()})
		return
	}

	gemini := services.NewGeminiClient()
	if !gemini.Available() {
		c.JSON(http.StatusOK, gin.H{
			"summary": "Market data currently unavailable. Please configure GEMINI_API_KEY.",
			"updated": time.Now(),
		})
		return
	}

	var result struct {
		Summary string `json:"summary"`
	}

	err := gemini.GenerateJSON(services.GeminiRequest{
		Model:         services.GeminiFlash,
		Prompt:        "Summarize the most important stock market news for today. Focus on major indices, notable movers, and key economic data. Be concise (3-4 sentences).",
		UseSearchTool: true,
		JSONSchema: map[string]interface{}{
			"type": "object",
			"properties": map[string]interface{}{
				"summary": map[string]interface{}{"type": "string"},
			},
			"required": []string{"summary"},
		},
	}, &result)

	if err != nil || result.Summary == "" {
		result.Summary = "Market is currently mixed with tech sector showing strength. Investors await upcoming economic data."
	}

	marketNewsCacheSvc.Set("market", result.Summary)
	c.JSON(http.StatusOK, gin.H{"summary": result.Summary, "updated": time.Now()})
}

func GetNewsItemFromGemini(ticker string) models.NewsItem {
	// Check cache
	if cached, ok := summaryCacheSvc.Get(ticker); ok {
		return cached
	}

	gemini := services.NewGeminiClient()
	if !gemini.Available() {
		return models.NewsItem{Summary: "AI service unavailable"}
	}

	var item models.NewsItem
	err := gemini.GenerateJSON(services.GeminiRequest{
		Model:         services.GeminiFlash,
		Prompt:        "Find the latest news for " + ticker + " stock today. Return: 1) Title 2) Summary (max 30 words) 3) Sentiment (bullish/bearish/neutral) 4) Source Name 5) Category (Technology/Finance/Health/Energy/Other).",
		UseSearchTool: true,
		JSONSchema: map[string]interface{}{
			"type": "object",
			"properties": map[string]interface{}{
				"ticker":    map[string]interface{}{"type": "string"},
				"title":     map[string]interface{}{"type": "string"},
				"summary":   map[string]interface{}{"type": "string"},
				"sentiment": map[string]interface{}{"type": "string", "enum": []string{"bullish", "bearish", "neutral"}},
				"source":    map[string]interface{}{"type": "string"},
				"category":  map[string]interface{}{"type": "string"},
			},
			"required": []string{"title", "summary", "sentiment", "category"},
		},
	}, &item)

	if err != nil {
		return models.NewsItem{Summary: "News temporarily unavailable for " + ticker}
	}

	if item.Ticker == "" {
		item.Ticker = ticker
	}

	// Update cache
	summaryCacheSvc.Set(ticker, item)
	return item
}

func SearchTickers(c *gin.Context) {
	query := strings.ToUpper(strings.TrimSpace(c.Query("q")))
	if query == "" {
		c.JSON(http.StatusOK, []string{})
		return
	}

	// Limit results
	const maxResults = 10
	matches := []string{}
	for _, t := range allTickers {
		if strings.HasPrefix(t.Symbol, query) || strings.Contains(strings.ToUpper(t.Name), query) {
			matches = append(matches, t.Symbol)
			if len(matches) >= maxResults {
				break
			}
		}
	}
	c.JSON(http.StatusOK, matches)
}
