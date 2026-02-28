package models

import "github.com/golang-jwt/jwt/v5"

type NewsItem struct {
	Ticker   string `json:"ticker"`
	Title    string `json:"title"`
	Summary  string `json:"summary"`
	Date     string `json:"date"`
	Sentiment string `json:"sentiment"` // "bullish", "bearish", "neutral"
	Source   string `json:"source"`
	Category string `json:"category"`
}

type Claims struct {
	Portfolio []string `json:"portfolio"`
	jwt.RegisteredClaims
}
