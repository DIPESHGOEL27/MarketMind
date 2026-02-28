package services

import (
	"sync"
	"time"
)

// TTLCache is a generic, thread-safe, in-memory cache with per-key TTL expiry.
// It replaces the 5+ inconsistent cache implementations across handlers.
type TTLCache[T any] struct {
	mu     sync.RWMutex
	data   map[string]cacheEntry[T]
	ttl    time.Duration
}

type cacheEntry[T any] struct {
	Value  T
	Expiry time.Time
}

// NewTTLCache creates a new cache with the specified default TTL.
func NewTTLCache[T any](ttl time.Duration) *TTLCache[T] {
	return &TTLCache[T]{
		data: make(map[string]cacheEntry[T]),
		ttl:  ttl,
	}
}

// Get retrieves a value from the cache. Returns the value and true if found
// and not expired, otherwise returns zero value and false.
func (c *TTLCache[T]) Get(key string) (T, bool) {
	c.mu.RLock()
	defer c.mu.RUnlock()

	entry, ok := c.data[key]
	if !ok || time.Now().After(entry.Expiry) {
		var zero T
		return zero, false
	}
	return entry.Value, true
}

// Set stores a value in the cache with the default TTL.
func (c *TTLCache[T]) Set(key string, value T) {
	c.mu.Lock()
	defer c.mu.Unlock()

	c.data[key] = cacheEntry[T]{
		Value:  value,
		Expiry: time.Now().Add(c.ttl),
	}
}

// SetWithTTL stores a value with a custom TTL, overriding the default.
func (c *TTLCache[T]) SetWithTTL(key string, value T, ttl time.Duration) {
	c.mu.Lock()
	defer c.mu.Unlock()

	c.data[key] = cacheEntry[T]{
		Value:  value,
		Expiry: time.Now().Add(ttl),
	}
}

// Delete removes a key from the cache.
func (c *TTLCache[T]) Delete(key string) {
	c.mu.Lock()
	defer c.mu.Unlock()
	delete(c.data, key)
}

// Len returns the number of entries in the cache (including expired ones).
func (c *TTLCache[T]) Len() int {
	c.mu.RLock()
	defer c.mu.RUnlock()
	return len(c.data)
}

// Cleanup removes all expired entries. Call this periodically if cache grows large.
func (c *TTLCache[T]) Cleanup() {
	c.mu.Lock()
	defer c.mu.Unlock()

	now := time.Now()
	for key, entry := range c.data {
		if now.After(entry.Expiry) {
			delete(c.data, key)
		}
	}
}
