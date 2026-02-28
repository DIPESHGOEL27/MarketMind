package services

import (
	"testing"
	"time"
)

func TestNewTTLCache(t *testing.T) {
	cache := NewTTLCache[string](5 * time.Minute)
	if cache == nil {
		t.Fatal("NewTTLCache returned nil")
	}
	if cache.Len() != 0 {
		t.Errorf("expected empty cache, got %d items", cache.Len())
	}
}

func TestTTLCache_SetAndGet(t *testing.T) {
	cache := NewTTLCache[string](5 * time.Minute)

	cache.Set("key1", "value1")
	cache.Set("key2", "value2")

	val, ok := cache.Get("key1")
	if !ok {
		t.Error("expected key1 to exist")
	}
	if val != "value1" {
		t.Errorf("expected value1, got %s", val)
	}

	val, ok = cache.Get("key2")
	if !ok {
		t.Error("expected key2 to exist")
	}
	if val != "value2" {
		t.Errorf("expected value2, got %s", val)
	}
}

func TestTTLCache_GetMiss(t *testing.T) {
	cache := NewTTLCache[string](5 * time.Minute)

	_, ok := cache.Get("nonexistent")
	if ok {
		t.Error("expected cache miss for nonexistent key")
	}
}

func TestTTLCache_Expiry(t *testing.T) {
	cache := NewTTLCache[string](1 * time.Millisecond)

	cache.Set("key1", "value1")

	// Wait for expiry
	time.Sleep(5 * time.Millisecond)

	_, ok := cache.Get("key1")
	if ok {
		t.Error("expected key1 to be expired")
	}
}

func TestTTLCache_SetWithTTL(t *testing.T) {
	cache := NewTTLCache[string](5 * time.Minute)

	// Set with very short TTL
	cache.SetWithTTL("short", "value", 1*time.Millisecond)
	// Set with longer TTL
	cache.Set("long", "value")

	time.Sleep(5 * time.Millisecond)

	_, ok := cache.Get("short")
	if ok {
		t.Error("expected short-TTL key to be expired")
	}

	_, ok = cache.Get("long")
	if !ok {
		t.Error("expected long-TTL key to still exist")
	}
}

func TestTTLCache_Delete(t *testing.T) {
	cache := NewTTLCache[string](5 * time.Minute)

	cache.Set("key1", "value1")
	cache.Delete("key1")

	_, ok := cache.Get("key1")
	if ok {
		t.Error("expected key1 to be deleted")
	}
}

func TestTTLCache_Overwrite(t *testing.T) {
	cache := NewTTLCache[string](5 * time.Minute)

	cache.Set("key1", "value1")
	cache.Set("key1", "value2")

	val, ok := cache.Get("key1")
	if !ok {
		t.Error("expected key1 to exist after overwrite")
	}
	if val != "value2" {
		t.Errorf("expected value2 after overwrite, got %s", val)
	}
}

func TestTTLCache_Cleanup(t *testing.T) {
	cache := NewTTLCache[string](1 * time.Millisecond)

	cache.Set("key1", "value1")
	cache.Set("key2", "value2")

	time.Sleep(5 * time.Millisecond)

	// Add a fresh entry
	cache.Set("key3", "value3")

	cache.Cleanup()

	if cache.Len() != 1 {
		t.Errorf("expected 1 item after cleanup (only key3), got %d", cache.Len())
	}
}

func TestTTLCache_Len(t *testing.T) {
	cache := NewTTLCache[int](5 * time.Minute)

	cache.Set("a", 1)
	cache.Set("b", 2)
	cache.Set("c", 3)

	if cache.Len() != 3 {
		t.Errorf("expected 3 items, got %d", cache.Len())
	}
}

func TestTTLCache_StructValues(t *testing.T) {
	type Quote struct {
		Symbol string
		Price  float64
	}

	cache := NewTTLCache[Quote](5 * time.Minute)

	cache.Set("AAPL", Quote{Symbol: "AAPL", Price: 150.0})

	val, ok := cache.Get("AAPL")
	if !ok {
		t.Fatal("expected AAPL to exist")
	}
	if val.Symbol != "AAPL" || val.Price != 150.0 {
		t.Errorf("expected {AAPL, 150.0}, got {%s, %f}", val.Symbol, val.Price)
	}
}

func TestTTLCache_ConcurrentAccess(t *testing.T) {
	cache := NewTTLCache[int](5 * time.Minute)

	done := make(chan bool, 100)

	// Concurrent writes
	for i := 0; i < 50; i++ {
		go func(n int) {
			cache.Set("key", n)
			done <- true
		}(i)
	}

	// Concurrent reads
	for i := 0; i < 50; i++ {
		go func() {
			cache.Get("key")
			done <- true
		}()
	}

	for i := 0; i < 100; i++ {
		<-done
	}
	// If we reach here without panic, concurrent access is safe
}
