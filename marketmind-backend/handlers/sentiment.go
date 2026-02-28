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

type MarketSentimentResponse struct {
	Region         string       `json:"region"`
	SentimentScore float64      `json:"sentimentScore"` // -1 (Bearish) to 1 (Bullish)
	SentimentLabel string       `json:"sentimentLabel"` // "Bullish", "Bearish", "Neutral"
	Summary        string       `json:"summary"`
	LiveUpdates    []LiveUpdate `json:"liveUpdates"`
}

// Shared cache for sentiment results (15 min TTL)
var sentimentCacheSvc = services.NewTTLCache[MarketSentimentResponse](15 * time.Minute)

func PredictMarketSentiment(c *gin.Context) {
	region := c.Query("region")
	if region == "" {
		region = "US"
	}
	titleCaser := cases.Title(language.English)
	region = titleCaser.String(strings.ToLower(region))

	// 1. Check Cache
	if cached, ok := sentimentCacheSvc.Get(region); ok {
		c.JSON(http.StatusOK, cached)
		return
	}

	// 2. Fetch Live Updates
	updates, err := ScrapeLiveUpdates(region)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch live updates for sentiment analysis"})
		return
	}

	// 3. Analyze with Gemini
	gemini := services.NewGeminiClient()
	var sentiment MarketSentimentResponse
	sentiment.Region = region
	sentiment.LiveUpdates = updates

	if gemini.Available() {
		if len(updates) > 0 {
			sentiment = analyzeWithGemini(gemini, updates, region)
		} else {
			// DEEP FALLBACK: If no updates found via scraper, use Gemini Search Grounding directly
			fmt.Printf("Deep fallback for %s sentiment using Gemini Search...\n", region)
			sentiment = fetchSentimentViaGeminiSearch(gemini, region)
		}
	} else {
		// Fallback for no API key
		sentiment.SentimentScore = 0
		sentiment.SentimentLabel = "Neutral"
		sentiment.Summary = "API key missing to predict sentiment."
	}

	// 4. Update Cache
	sentimentCacheSvc.Set(region, sentiment)

	c.JSON(http.StatusOK, sentiment)
}

func analyzeWithGemini(gemini *services.GeminiClient, updates []LiveUpdate, region string) MarketSentimentResponse {
	var headlines []string
	for _, u := range updates {
		headlines = append(headlines, u.Headline)
	}

	prompt := fmt.Sprintf(`Act as a senior market analyst. Based on these recent news headlines for the %s market, predict the current market sentiment.
	
	Headlines:
	%s
	
	Return a JSON object with:
	1. score: a number from -1.0 (strongly bearish/negative) to 1.0 (strongly bullish/positive)
	2. label: one word: "Bullish", "Bearish", or "Neutral"
	3. summary: a concise 1-2 sentence explanation of the sentiment based on the news.
	`, region, strings.Join(headlines, "\n"))

	resp := MarketSentimentResponse{
		Region:      region,
		LiveUpdates: updates,
	}

	var analysis struct {
		Score   float64 `json:"score"`
		Label   string  `json:"label"`
		Summary string  `json:"summary"`
	}

	err := gemini.GenerateJSON(services.GeminiRequest{
		Model:  services.GeminiFlash,
		Prompt: prompt,
		JSONSchema: map[string]interface{}{
			"type": "object",
			"properties": map[string]interface{}{
				"score":   map[string]interface{}{"type": "number"},
				"label":   map[string]interface{}{"type": "string", "enum": []string{"Bullish", "Bearish", "Neutral"}},
				"summary": map[string]interface{}{"type": "string"},
			},
			"required": []string{"score", "label", "summary"},
		},
	}, &analysis)

	if err != nil {
		resp.SentimentLabel = "Neutral"
		resp.Summary = "AI sentiment analysis temporarily unavailable."
		return resp
	}

	resp.SentimentScore = analysis.Score
	resp.SentimentLabel = analysis.Label
	resp.Summary = analysis.Summary
	return resp
}

func fetchSentimentViaGeminiSearch(gemini *services.GeminiClient, region string) MarketSentimentResponse {
	prompt := fmt.Sprintf("Act as a financial expert. What is the current market sentiment for the %s market right now? Mention recent Index levels (NIFTY/S&P 500) and news. Return a JSON object with: score (-1 to 1), label (Bullish/Bearish/Neutral), and summary (concise).", region)

	resp := MarketSentimentResponse{Region: region, LiveUpdates: []LiveUpdate{}}

	var analysis struct {
		Score   float64 `json:"score"`
		Label   string  `json:"label"`
		Summary string  `json:"summary"`
	}

	err := gemini.GenerateJSON(services.GeminiRequest{
		Model:  services.GeminiFlash,
		Prompt: prompt,
	}, &analysis)

	if err != nil {
		resp.SentimentLabel = "Neutral"
		resp.Summary = "AI could not reach a consensus on market sentiment."
		return resp
	}

	resp.SentimentScore = analysis.Score
	resp.SentimentLabel = analysis.Label
	resp.Summary = analysis.Summary
	return resp
}
