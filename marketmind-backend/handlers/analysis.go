package handlers

import (
	"net/http"
	"regexp"
	"strings"

	"marketmind-backend/services"

	"github.com/gin-gonic/gin"
)

// validTicker matches 1-5 uppercase letters, optionally followed by a dot and 1 letter (e.g., BRK.A)
var validTicker = regexp.MustCompile(`^[A-Z]{1,5}(\.[A-Z])?$`)

func AnalyzeTicker(c *gin.Context) {
	var body struct {
		Ticker string `json:"ticker"`
	}
	if err := c.BindJSON(&body); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request body"})
		return
	}

	ticker := strings.TrimSpace(strings.ToUpper(body.Ticker))
	if ticker == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Ticker is required"})
		return
	}

	// Allow free-form questions (for chat) or validate as ticker
	isTicker := validTicker.MatchString(ticker)

	gemini := services.NewGeminiClient()
	if !gemini.Available() {
		c.JSON(http.StatusServiceUnavailable, gin.H{"error": "AI analysis service unavailable"})
		return
	}

	var prompt string
	if isTicker {
		prompt = "Perform a deep-dive analysis for " + ticker + " stock. Include Bull Case, Bear Case, Key Risks, and a 12-month Outlook. Format the output in Markdown."
	} else {
		// Free-form question (chat mode)
		prompt = "You are MarketMind AI, a financial market assistant. Answer this question concisely: " + body.Ticker
	}

	resp, err := gemini.Generate(services.GeminiRequest{
		Model:         services.GeminiPro,
		Prompt:        prompt,
		ThinkingLevel: "high",
	})
	if err != nil {
		c.JSON(http.StatusServiceUnavailable, gin.H{"error": "AI analysis unavailable: " + err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"analysis": resp.Text})
}
