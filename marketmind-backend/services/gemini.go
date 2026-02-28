package services

import (
	"bytes"
	"encoding/json"
	"fmt"
	"net/http"
	"os"
	"time"
)

// GeminiModel constants for consistent model selection across the app.
const (
	GeminiFlash = "gemini-3-flash-preview" // Fast: classification, sentiment, news enrichment
	GeminiPro   = "gemini-3-pro-preview"   // Deep: ticker analysis with reasoning
)

// GeminiClient provides a centralized HTTP client for Gemini API calls.
type GeminiClient struct {
	apiKey     string
	httpClient *http.Client
	baseURL    string
}

// NewGeminiClient creates a client with sensible defaults.
// Returns nil if GEMINI_API_KEY is not set.
func NewGeminiClient() *GeminiClient {
	key := os.Getenv("GEMINI_API_KEY")
	if key == "" {
		return nil
	}
	return &GeminiClient{
		apiKey:     key,
		httpClient: &http.Client{Timeout: 30 * time.Second},
		baseURL:    "https://generativelanguage.googleapis.com/v1beta/models",
	}
}

// GeminiRequest holds the parameters for a Gemini API call.
type GeminiRequest struct {
	Model            string                 // e.g. GeminiFlash or GeminiPro
	Prompt           string                 // The text prompt
	JSONSchema       map[string]interface{} // Optional: responseJsonSchema for structured output
	UseSearchTool    bool                   // Whether to include Google Search grounding
	ThinkingLevel    string                 // Optional: "low", "medium", "high" for thinking config
}

// GeminiResponse is a simplified wrapper around the raw Gemini API response.
type GeminiResponse struct {
	Text       string                 // Extracted text from candidates[0].content.parts
	RawResult  map[string]interface{} // Full parsed JSON response
}

// Generate sends a request to the Gemini API and extracts the text response.
func (gc *GeminiClient) Generate(req GeminiRequest) (*GeminiResponse, error) {
	if gc == nil {
		return nil, fmt.Errorf("gemini client not initialized (GEMINI_API_KEY missing)")
	}

	model := req.Model
	if model == "" {
		model = GeminiFlash
	}

	url := fmt.Sprintf("%s/%s:generateContent?key=%s", gc.baseURL, model, gc.apiKey)

	// Build request body
	body := map[string]interface{}{
		"contents": []map[string]interface{}{
			{
				"parts": []map[string]string{
					{"text": req.Prompt},
				},
			},
		},
	}

	// Generation config
	genConfig := map[string]interface{}{}
	if req.JSONSchema != nil {
		genConfig["responseMimeType"] = "application/json"
		genConfig["responseJsonSchema"] = req.JSONSchema
	}
	if req.ThinkingLevel != "" {
		genConfig["thinkingConfig"] = map[string]interface{}{
			"thinkingLevel": req.ThinkingLevel,
		}
	}
	if len(genConfig) > 0 {
		body["generationConfig"] = genConfig
	}

	// Tools
	if req.UseSearchTool {
		body["tools"] = []map[string]interface{}{
			{"googleSearch": map[string]interface{}{}},
		}
	}

	jsonBody, err := json.Marshal(body)
	if err != nil {
		return nil, fmt.Errorf("failed to marshal request: %w", err)
	}

	httpReq, err := http.NewRequest("POST", url, bytes.NewBuffer(jsonBody))
	if err != nil {
		return nil, fmt.Errorf("failed to create request: %w", err)
	}
	httpReq.Header.Set("Content-Type", "application/json")

	resp, err := gc.httpClient.Do(httpReq)
	if err != nil {
		return nil, fmt.Errorf("gemini API request failed: %w", err)
	}
	defer resp.Body.Close()

	var result map[string]interface{}
	if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
		return nil, fmt.Errorf("failed to decode response: %w", err)
	}

	// Extract text from the standard Gemini response path
	text, err := extractGeminiText(result)
	if err != nil {
		return &GeminiResponse{RawResult: result}, err
	}

	return &GeminiResponse{Text: text, RawResult: result}, nil
}

// GenerateJSON sends a request and unmarshals the JSON text response into the target.
func (gc *GeminiClient) GenerateJSON(req GeminiRequest, target interface{}) error {
	resp, err := gc.Generate(req)
	if err != nil {
		return err
	}
	if err := json.Unmarshal([]byte(resp.Text), target); err != nil {
		return fmt.Errorf("failed to parse Gemini JSON response: %w (raw: %s)", err, resp.Text)
	}
	return nil
}

// extractGeminiText safely navigates the Gemini response structure:
// candidates[0].content.parts[last].text
// Uses safe type assertions instead of panic-prone chains.
func extractGeminiText(result map[string]interface{}) (string, error) {
	candidates, ok := result["candidates"].([]interface{})
	if !ok || len(candidates) == 0 {
		return "", fmt.Errorf("no candidates in Gemini response")
	}

	firstCandidate, ok := candidates[0].(map[string]interface{})
	if !ok {
		return "", fmt.Errorf("invalid candidate format")
	}

	content, ok := firstCandidate["content"].(map[string]interface{})
	if !ok {
		return "", fmt.Errorf("no content in candidate")
	}

	parts, ok := content["parts"].([]interface{})
	if !ok || len(parts) == 0 {
		return "", fmt.Errorf("no parts in content")
	}

	// For thinking models, the last part typically has the final text
	// Iterate from the end to find the text part
	for i := len(parts) - 1; i >= 0; i-- {
		partMap, ok := parts[i].(map[string]interface{})
		if !ok {
			continue
		}
		if text, hasText := partMap["text"].(string); hasText && text != "" {
			return text, nil
		}
	}

	return "", fmt.Errorf("no text found in response parts")
}

// Available returns true if the client is initialized with an API key.
func (gc *GeminiClient) Available() bool {
	return gc != nil && gc.apiKey != ""
}
