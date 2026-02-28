package handlers

import (
	"fmt"
	"net/http"
	"strings"
	"time"

	"marketmind-backend/services"

	"github.com/gin-gonic/gin"
	"golang.org/x/text/cases"
	"golang.org/x/text/language"
)

// Shared cache for market indices (5 min TTL)
var indicesCacheSvc = services.NewTTLCache[[]MarketIndex](5 * time.Minute)

func FetchMarketIndices(c *gin.Context) {
	region := c.Query("region")
	if region == "" {
		region = "US"
	}
	titleCaser := cases.Title(language.English)
	region = titleCaser.String(strings.ToLower(region))

	// Check cache
	if cached, ok := indicesCacheSvc.Get(region); ok {
		c.JSON(http.StatusOK, cached)
		return
	}

	// Scrape if cache miss or expired
	items, err := ScrapeMarketIndices(region)

	// If scraper returns nothing, try Gemini Search Grounding as deep fallback
	if err != nil || len(items) == 0 {
		fmt.Printf("Scraper failed for %s indices, trying Gemini Search fallback...\n", region)
		gemini := services.NewGeminiClient()
		if gemini.Available() {
			items = fetchIndicesViaGeminiSearch(gemini, region)
		}
	}

	// Update cache
	if len(items) > 0 {
		indicesCacheSvc.Set(region, items)
	}

	c.JSON(http.StatusOK, items)
}

func fetchIndicesViaGeminiSearch(gemini *services.GeminiClient, region string) []MarketIndex {
	prompt := fmt.Sprintf("Act as a market data provider. What are the current levels for major indices in the %s market? (e.g. NIFTY 50, SENSEX, Dow, S&P 500). Return a JSON array of objects with: name, price (number), change (percentage number).", region)

	var indices []MarketIndex
	err := gemini.GenerateJSON(services.GeminiRequest{
		Model:  services.GeminiFlash,
		Prompt: prompt,
	}, &indices)

	if err != nil {
		return []MarketIndex{}
	}

	// Add region to results
	for i := range indices {
		indices[i].Region = region
	}

	return indices
}
