package handlers

import (
	"encoding/json"
	"fmt"
	"net/http"
	"net/url"
	"os"
	"strings"
	"time"

	"marketmind-backend/models"
	"marketmind-backend/services"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
)

func getNewsAPIKey() string {
	key := os.Getenv("NEWSAPI_KEY")
	if key == "" {
		fmt.Println("WARNING: NEWSAPI_KEY not set, news will rely on scraper fallback")
	}
	return key
}

type NewsApiResponse struct {
	Status       string `json:"status"`
	TotalResults int    `json:"totalResults"`
	Articles     []struct {
		Source struct {
			Name string `json:"name"`
		} `json:"source"`
		Title       string `json:"title"`
		Description string `json:"description"`
		Url         string `json:"url"`
		PublishedAt string `json:"publishedAt"`
	} `json:"articles"`
}

func FetchNewsHybrid(c *gin.Context) {
	// Parse token to get portfolio context (optional)
	query := "finance stock market"
	tokenStr := strings.TrimPrefix(c.GetHeader("Authorization"), "Bearer ")
	if tokenStr != "" {
		claims := &models.Claims{}
		token, _ := jwt.ParseWithClaims(tokenStr, claims, func(t *jwt.Token) (interface{}, error) {
			return JwtKey, nil
		})
		if token != nil && token.Valid && len(claims.Portfolio) > 0 {
			// Limit to first 3 tickers to keep query concise and relevant
			limit := 3
			if len(claims.Portfolio) < 3 { limit = len(claims.Portfolio) }
			query = strings.Join(claims.Portfolio[:limit], " OR ")
		}
	}

	// 1. Fetch from NewsAPI
	client := &http.Client{Timeout: 10 * time.Second}
	// Simplified query without OR for stability
	cleanQuery := strings.ReplaceAll(query, " OR ", " ")
	apiUrl := fmt.Sprintf("https://newsapi.org/v2/everything?q=%s&sortBy=publishedAt&language=en&pageSize=10&apiKey=%s", url.QueryEscape(cleanQuery), getNewsAPIKey())
	
	resp, err := client.Get(apiUrl)
	
	// Helper to use fallback scraper
	useFallback := func() {
		fmt.Println("Attempting fallback to Google Finance News Scraper...")
		scrapedNews, err := ScrapeGoogleFinanceNews(query)
		if err != nil || len(scrapedNews) == 0 {
			// Try general news if specific query failed
			scrapedNews, err = ScrapeGoogleFinanceNews("")
		}
		
		if err == nil && len(scrapedNews) > 0 {
			finalNews := []models.NewsItem{}
			geminiClient := services.NewGeminiClient()
			
			for _, item := range scrapedNews {
				newsItem := models.NewsItem{
					Title:   item.Title,
					Summary: item.Summary,
					Source:  item.Source,
					Date:    item.Date,
				}
				
				if geminiClient.Available() {
					newsItem = EnrichWithGemini(geminiClient, newsItem)
				} else {
					newsItem.Sentiment = "neutral"
					newsItem.Category = "General"
				}
				finalNews = append(finalNews, newsItem)
			}
			c.JSON(http.StatusOK, finalNews)
		} else {
			// Absolute last resort: Return a system message instead of 500 to keep UI alive
			fallbackItem := models.NewsItem{
				Title:     "MarketMind System Message",
				Summary:   "Could not fetch real-time news at this moment. Please try again later.",
				Source:    "System",
				Date:      time.Now().Format(time.RFC3339),
				Sentiment: "neutral",
				Category:  "General",
			}
			c.JSON(http.StatusOK, []models.NewsItem{fallbackItem})
		}
	}

	if err != nil {
		fmt.Printf("NewsAPI Network Error: %v\n", err)
		useFallback()
		return
	}
	defer resp.Body.Close()

	if resp.StatusCode != 200 {
		fmt.Printf("NewsAPI Error Status: %d\n", resp.StatusCode)
		// Try to read body for error details
		var bodyErr map[string]interface{}
		if err := json.NewDecoder(resp.Body).Decode(&bodyErr); err == nil {
			fmt.Printf("NewsAPI Error Body: %v\n", bodyErr)
		}
		
		fmt.Println("Triggering fallback due to API error...")
		useFallback()
		return
	}

	var newsResp NewsApiResponse
	if err := json.NewDecoder(resp.Body).Decode(&newsResp); err != nil {
		fmt.Printf("NewsAPI JSON Parse Error: %v\n", err)
		// If JSON parse fails but status was 200, it might be HTML or empty body
		fmt.Println("Triggering fallback due to JSON parse error...")
		useFallback()
		return
	}
	
	// If no articles found, also try fallback
	if len(newsResp.Articles) == 0 {
		useFallback()
		return
	}

	// 2. Enrich with Gemini (Sentiment & Category)
	// We'll process top 6 articles
	finalNews := []models.NewsItem{}
	gemini := services.NewGeminiClient()

	for i, article := range newsResp.Articles {
		if i >= 6 { break }
		
		item := models.NewsItem{
			Title:   article.Title,
			Summary: article.Description,
			Source:  article.Source.Name,
			Date:    article.PublishedAt,
		}
		
		// Basic cleaning
		if item.Summary == "" { item.Summary = item.Title }

		if gemini.Available() {
			item = EnrichWithGemini(gemini, item)
		} else {
			item.Sentiment = "neutral" 
			item.Category = "General"
		}
		finalNews = append(finalNews, item)
	}

	c.JSON(http.StatusOK, finalNews)
}

func EnrichWithGemini(gemini *services.GeminiClient, item models.NewsItem) models.NewsItem {
	prompt := `Analyze this financial news article.
	Title: ` + item.Title + `
	Summary: ` + item.Summary + `
	
	Return a JSON object with:
	1. sentiment: "bullish", "bearish", or "neutral"
	2. category: "Technology", "Finance", "Energy", "Healthcare", "Crypto", or "General"
	`

	var analysis struct {
		Sentiment string `json:"sentiment"`
		Category  string `json:"category"`
	}

	err := gemini.GenerateJSON(services.GeminiRequest{
		Model:  services.GeminiFlash,
		Prompt: prompt,
		JSONSchema: map[string]interface{}{
			"type": "object",
			"properties": map[string]interface{}{
				"sentiment": map[string]interface{}{"type": "string", "enum": []string{"bullish", "bearish", "neutral"}},
				"category":  map[string]interface{}{"type": "string"},
			},
			"required": []string{"sentiment", "category"},
		},
	}, &analysis)

	if err != nil {
		item.Sentiment = "neutral"
		item.Category = "General"
		return item
	}

	item.Sentiment = analysis.Sentiment
	item.Category = analysis.Category
	return item
}
