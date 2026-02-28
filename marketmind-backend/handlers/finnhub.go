package handlers

import (
	"encoding/json"
	"fmt"
	"net/http"
	"os"
	"strings"
	"sync"
	"time"

	"github.com/gin-gonic/gin"
)

// FinnhubQuote represents the response from Finnhub /quote endpoint
type FinnhubQuote struct {
	C float64 `json:"c"` // Current price
	D float64 `json:"d"` // Change
	L float64 `json:"l"` // Low
	H float64 `json:"h"` // High
	O float64 `json:"o"` // Open
	P float64 `json:"pc"` // Previous close
}

// Internal StockQuote struct (same as before)
type SimpleQuote struct {
	Symbol string  `json:"symbol"`
	Price  float64 `json:"price"`
	Change float64 `json:"change"`
}

var (
	// Basic in-memory cache to respect rate limits (60 calls/min free tier)
	quoteCache = struct {
		sync.RWMutex
		Data   map[string]SimpleQuote
		Expiry map[string]time.Time
	}{
		Data:   make(map[string]SimpleQuote),
		Expiry: make(map[string]time.Time),
	}
)

func getFinnhubAPIKey() string {
	key := os.Getenv("FINNHUB_API_KEY")
	if key == "" {
		fmt.Println("WARNING: FINNHUB_API_KEY not set, stock quotes will rely on scraper fallback")
	}
	return key
}

func FetchFinnhubQuotes(c *gin.Context) {
	tickersStr := c.Query("tickers")
	if tickersStr == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "tickers query param required"})
		return
	}
	
	tickers := strings.Split(tickersStr, ",")
	results := []SimpleQuote{}
	
	client := &http.Client{Timeout: 10 * time.Second}

	for _, t := range tickers {
		// Check cache (1 minute TTL)
		quoteCache.RLock()
		if val, ok := quoteCache.Data[t]; ok {
			if time.Now().Before(quoteCache.Expiry[t]) {
				results = append(results, val)
				quoteCache.RUnlock()
				continue
			}
		}
		quoteCache.RUnlock()

		// Try Finnhub first
		finnhubKey := getFinnhubAPIKey()
		url := "https://finnhub.io/api/v1/quote?symbol=" + t + "&token=" + finnhubKey
		resp, err := client.Get(url)
		
		var q SimpleQuote
		finnhubSuccess := false
		
		if err == nil {
			var fq FinnhubQuote
			if err := json.NewDecoder(resp.Body).Decode(&fq); err == nil && fq.C != 0 {
				percentChange := 0.0
				if fq.P != 0 {
					percentChange = (fq.D / fq.P) * 100
				}
				q = SimpleQuote{
					Symbol: t,
					Price:  fq.C,
					Change: percentChange,
				}
				finnhubSuccess = true
			}
			resp.Body.Close()
		}
		
		// Fallback to Google Finance scraper if Finnhub fails
		if !finnhubSuccess {
			gfQuote, err := ScrapeGoogleFinance(t)
			if err == nil && gfQuote.Price > 0 {
				q = SimpleQuote{
					Symbol: gfQuote.Symbol,
					Price:  gfQuote.Price,
					Change: gfQuote.Change,
				}
			} else {
				// Skip this ticker if both sources fail
				continue
			}
		}
		
		// Update cache
		quoteCache.Lock()
		quoteCache.Data[t] = q
		quoteCache.Expiry[t] = time.Now().Add(1 * time.Minute)
		quoteCache.Unlock()
		
		results = append(results, q)
	}

	c.JSON(http.StatusOK, results)
}
