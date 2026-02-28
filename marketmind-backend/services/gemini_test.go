package services

import (
	"testing"
)

func TestNewGeminiClient_NoKey(t *testing.T) {
	// Unset env var for this test
	t.Setenv("GEMINI_API_KEY", "")

	client := NewGeminiClient()
	if client != nil {
		t.Error("expected nil client when GEMINI_API_KEY is empty")
	}
}

func TestNewGeminiClient_WithKey(t *testing.T) {
	t.Setenv("GEMINI_API_KEY", "test-key-123")

	client := NewGeminiClient()
	if client == nil {
		t.Fatal("expected non-nil client when GEMINI_API_KEY is set")
	}
	if !client.Available() {
		t.Error("expected client to be available")
	}
}

func TestGeminiClient_Available(t *testing.T) {
	// nil client
	var nilClient *GeminiClient
	if nilClient.Available() {
		t.Error("nil client should not be available")
	}

	// client with key
	t.Setenv("GEMINI_API_KEY", "test-key")
	client := NewGeminiClient()
	if !client.Available() {
		t.Error("client with key should be available")
	}
}

func TestGeminiClient_Generate_NilClient(t *testing.T) {
	var client *GeminiClient
	_, err := client.Generate(GeminiRequest{Prompt: "test"})
	if err == nil {
		t.Error("expected error from nil client")
	}
}

func TestExtractGeminiText_ValidResponse(t *testing.T) {
	response := map[string]interface{}{
		"candidates": []interface{}{
			map[string]interface{}{
				"content": map[string]interface{}{
					"parts": []interface{}{
						map[string]interface{}{
							"text": "Hello, world!",
						},
					},
				},
			},
		},
	}

	text, err := extractGeminiText(response)
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if text != "Hello, world!" {
		t.Errorf("expected 'Hello, world!', got '%s'", text)
	}
}

func TestExtractGeminiText_NoCandidates(t *testing.T) {
	response := map[string]interface{}{}
	_, err := extractGeminiText(response)
	if err == nil {
		t.Error("expected error for missing candidates")
	}
}

func TestExtractGeminiText_EmptyCandidates(t *testing.T) {
	response := map[string]interface{}{
		"candidates": []interface{}{},
	}
	_, err := extractGeminiText(response)
	if err == nil {
		t.Error("expected error for empty candidates")
	}
}

func TestExtractGeminiText_NoParts(t *testing.T) {
	response := map[string]interface{}{
		"candidates": []interface{}{
			map[string]interface{}{
				"content": map[string]interface{}{
					"parts": []interface{}{},
				},
			},
		},
	}
	_, err := extractGeminiText(response)
	if err == nil {
		t.Error("expected error for empty parts")
	}
}

func TestExtractGeminiText_ThinkingModel(t *testing.T) {
	// Thinking models may have a thought part followed by the actual text
	response := map[string]interface{}{
		"candidates": []interface{}{
			map[string]interface{}{
				"content": map[string]interface{}{
					"parts": []interface{}{
						map[string]interface{}{
							"thought": true,
							"text":    "",
						},
						map[string]interface{}{
							"text": "Final answer here",
						},
					},
				},
			},
		},
	}

	text, err := extractGeminiText(response)
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if text != "Final answer here" {
		t.Errorf("expected 'Final answer here', got '%s'", text)
	}
}

func TestGeminiRequest_DefaultModel(t *testing.T) {
	req := GeminiRequest{Prompt: "test"}
	if req.Model != "" {
		t.Error("expected empty model by default")
	}
	// The Generate method should default to GeminiFlash
}
