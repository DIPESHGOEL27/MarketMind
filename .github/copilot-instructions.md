# MarketMind Copilot Instructions

## Architecture Overview

MarketMind is a **monorepo** with two services:

- **Backend** (`marketmind-backend/`): Go + Gin REST API on `:8080`
- **Frontend** (`marketmind-frontend/`): Next.js 15 + React 19 + Tailwind on `:3000`

### Data Flow Pattern: "Never-Fail" Resilience

All data pipelines use **layered fallbacks**:

```
Primary API → Scraper Fallback → System Message (200 OK always)
```

- Stock quotes: Finnhub API → Google Finance scraper (`handlers/scraper.go`)
- News: NewsAPI → Google Finance News scraper → Gemini-generated fallback
- Sentiment: Live scraper → Gemini Search Grounding → neutral default

## Development Commands

```bash
# Backend
cd marketmind-backend
go run main.go              # Requires .env (see below)

# Frontend
cd marketmind-frontend
npm install                 # First time only
npm run dev                 # Uses Turbopack (next dev --turbopack)
```

### Required Environment Variables (`.env`)

```bash
GEMINI_API_KEY=xxx          # Required for AI features
FINNHUB_API_KEY=xxx         # Stock quotes (has scraper fallback)
NEWSAPI_KEY=xxx             # News feed (has scraper fallback)
JWT_SECRET=xxx              # Auto-generated via crypto/rand if not set
CORS_ORIGINS=http://localhost:3000  # Comma-separated allowed origins
PORT=8080                   # Backend port (configurable)
```

### Docker

```bash
make docker-up              # Start both services with Docker Compose
make docker-down            # Stop services
make docker-logs            # Tail logs
make test                   # Run all 38 backend tests
```

## Gemini AI Integration

### Model Selection by Use Case

| Feature              | Model                    | Why                                          |
| -------------------- | ------------------------ | -------------------------------------------- |
| News enrichment      | `gemini-3-flash-preview` | Fast, structured JSON output                 |
| Market sentiment     | `gemini-3-flash-preview` | Quick analysis of headlines                  |
| Deep ticker analysis | `gemini-3-pro-preview`   | Complex reasoning with `thinkingLevel: high` |

### Structured Output Pattern (JSON Schema)

Used in `EnrichWithGemini()` for reliable parsing:

```go
"generationConfig": map[string]interface{}{
    "responseMimeType": "application/json",
    "responseJsonSchema": map[string]interface{}{
        "type": "object",
        "properties": map[string]interface{}{
            "sentiment": map[string]interface{}{"type": "string", "enum": []string{"bullish", "bearish", "neutral"}},
            "category":  map[string]interface{}{"type": "string"},
        },
        "required": []string{"sentiment", "category"},
    },
}
```

### Prompt Engineering Patterns

- **News sentiment**: Returns `{sentiment, category}` - see `handlers/newsapi.go:EnrichWithGemini()`
- **Market sentiment**: Returns `{score, label, summary}` - see `handlers/sentiment.go:analyzeWithGemini()`
- **Ticker analysis**: Free-form Markdown with Bull/Bear/Risk sections - see `handlers/analysis.go`

### Response Extraction Pattern

All Gemini handlers now use `services.GeminiClient`:

```go
client := services.NewGeminiClient()  // nil-safe if no API key
resp, err := client.Generate(services.GeminiRequest{
    Prompt: "...",
    Model:  services.GeminiFlash,  // or GeminiPro
})
// resp.Text contains extracted text
```

For structured JSON output:

```go
var result MyStruct
err := client.GenerateJSON(req, &result)  // Unmarshals directly
```

## Critical Conventions

### Backend (Go/Gin)

- **Handler location**: All API handlers in `handlers/` - one file per domain
- **Services layer**: `services/gemini.go` (shared AI client), `services/cache.go` (generic TTL cache)
- **Middleware**: `middleware/auth.go` (JWT auth + Request ID)
- **Caching**: Generic `TTLCache[T]` with configurable TTL:
  - Quotes: 1 min (`quoteCache` in `finnhub.go`)
  - News: 10 min (`summaryCacheSvc` in `news.go`), 15 min (`marketNewsCacheSvc`)
  - Sentiment: 15 min (`sentimentCacheSvc` in `sentiment.go`)
  - Indices: 5 min (`indicesCacheSvc` in `indices.go`)
- **JWT key**: Initialized via `handlers.InitHandlers()` — auto-generates 32-byte key via crypto/rand if `JWT_SECRET` not set
- **Models**: Shared types in `models/models.go` - `NewsItem` and JWT `Claims`
- **Testing**: 38 tests across `services/`, `middleware/`, `handlers/` — run with `make test`
- **Input validation**: Ticker regex `^[A-Z]{1,5}(\.[A-Z])?$`, portfolio max 20 tickers
- **Graceful shutdown**: Signal handling with 10s drain timeout in `main.go`

### Frontend (Next.js/React)

- **Tab components**: Each tab in `src/components/tabs/` — self-contained with own state where possible
- **UI components**: shadcn/ui in `src/components/ui/` - use existing primitives
- **Custom hooks**: `useWebSocket` with exponential backoff reconnection (1s→30s, 5 retries)
- **Error handling**: `ErrorBoundary` wraps tab content in `page.tsx`
- **State pattern**: `useState` + `localStorage` for portfolio persistence
- **Environment vars**: `NEXT_PUBLIC_API_URL`, `NEXT_PUBLIC_WS_URL` (defaults to localhost)
- **Debounced search**: TickerSearch uses 300ms debounce with AbortController for request cancellation
- **React.memo**: All tab components are memoized to prevent unnecessary re-renders
- **Standalone output**: `next.config.ts` uses `output: 'standalone'` for Docker builds

### WebSocket Integration

- **Endpoint**: `/ws?token=<jwt>` - token is **required** for auth
- **Backend broadcasts**: Every 60s via `BroadcastNewsLoop()` in `handlers/websocket.go`
- **Frontend hook**: `useWebSocket<T>(url, token)` returns `{ data, error, isConnected, retryCount }`
- **Reconnection**: Exponential backoff with ±25% jitter, max 5 retries, 30s cap
- **Data format**: Array of `NewsItem` objects per message
- **Client tracking**: `SafeWsClients` map stores connection → portfolio mapping

## API Endpoints Reference

| Endpoint                          | Method | Auth   | Handler                  | Purpose               |
| --------------------------------- | ------ | ------ | ------------------------ | --------------------- |
| `/health`                         | GET    | No     | (inline)                 | Health check          |
| `/api/news`                       | GET    | Bearer | `FetchNewsHybrid`        | AI-enriched news feed |
| `/api/market-news`                | GET    | No     | `FetchMarketNews`        | AI market summary     |
| `/api/quotes?tickers=X,Y`         | GET    | No     | `FetchFinnhubQuotes`     | Stock prices          |
| `/api/market-indices`             | GET    | No     | `FetchMarketIndices`     | S&P, NASDAQ, NIFTY    |
| `/api/market-sentiment?region=US` | GET    | No     | `PredictMarketSentiment` | AI market analysis    |
| `/api/search-tickers?q=AA`        | GET    | No     | `SearchTickers`          | Ticker autocomplete   |
| `/api/analyze-ticker`             | POST   | Bearer | `AnalyzeTicker`          | Deep AI analysis      |
| `/api/user/update-portfolio`      | POST   | Bearer | `UpdatePortfolio`        | Save portfolio to JWT |
| `/ws?token=xxx`                   | WS     | Query  | `HandleWebSocket`        | Real-time news stream |

## Common Patterns

### Adding a New API Endpoint

1. Create handler in `handlers/<domain>.go`
2. Register route in `main.go` (public group or auth group as needed)
3. Add fallback logic if using external APIs
4. Add caching with `services.NewTTLCache[T](ttl)`
5. Add tests in `handlers/handlers_test.go`

### Adding Gemini AI Feature

1. Use shared client: `client := services.NewGeminiClient()`
2. Choose model: `services.GeminiFlash` (fast) or `services.GeminiPro` (deep reasoning)
3. For structured output: `client.GenerateJSON(req, &target)` with JSONSchema field
4. For free-form text: `client.Generate(req)` — returns `resp.Text`
5. Always check `client.Available()` before calling
6. Handle nil client / empty response with neutral defaults

### Scraper Selectors (Google Finance - Jan 2026)

- **Price**: `.YMlKec.fxKbKc` or `.YMlKec` (fallback)
- **Change %**: `.JwB6zf`
- **News cards**: `.JaNLYd` container, `.pGmFU` title, `.ZMiNk` source
- **Legacy news**: `.yY3Lee` container, `.Yfwt5` title
- **Exchange mapping**: `exchangeMap` in `handlers/scraper.go` (NASDAQ default)

### JWT Claims Structure

```go
type Claims struct {
    Portfolio []string `json:"portfolio"`  // User's tracked tickers
    jwt.RegisteredClaims                   // 24-hour expiry
}
```

## Key Files Reference

| Purpose          | Backend                   | Frontend                           |
| ---------------- | ------------------------- | ---------------------------------- |
| Entry point      | `main.go`                 | `src/app/page.tsx`                 |
| Gemini client    | `services/gemini.go`      | -                                  |
| TTL cache        | `services/cache.go`       | -                                  |
| Auth middleware  | `middleware/auth.go`      | -                                  |
| News pipeline    | `handlers/newsapi.go`     | `components/tabs/NewsTab.tsx`      |
| Quote pipeline   | `handlers/finnhub.go`     | (uses REST fetch in page.tsx)      |
| Fallback scraper | `handlers/scraper.go`     | -                                  |
| AI analysis      | `handlers/analysis.go`    | `components/tabs/AnalysisTab.tsx`  |
| AI chat          | (shares analysis handler) | `components/tabs/ChatTab.tsx`      |
| Market sentiment | `handlers/sentiment.go`   | `components/tabs/DashboardTab.tsx` |
| WebSocket        | `handlers/websocket.go`   | `hooks/useWebSocket.ts`            |
| Portfolio mgmt   | `handlers/portfolio.go`   | `components/tabs/PortfolioTab.tsx` |
| Error handling   | -                         | `components/ErrorBoundary.tsx`     |
| Data models      | `models/models.go`        | `components/NewsCardV2.tsx`        |
| Shared JWT key   | `handlers/common.go`      | -                                  |
| Docker           | `Dockerfile`              | `Dockerfile`                       |
| Tests            | `*_test.go` (38 tests)    | -                                  |

## Gotchas & Known Issues

1. **CORS**: Configurable via `CORS_ORIGINS` env var — set for production domains
2. **JWT_SECRET**: Auto-generated via crypto/rand if not set — explicitly set in production
3. **Scraper selectors**: Google Finance layout changes periodically — selectors may need updates
4. **WebSocket URL**: Frontend default is `ws://localhost:8080/ws` — use `wss://` for production
5. **Rate limits**: Finnhub free tier = 60 calls/min, NewsAPI = 100/day — TTL caching mitigates this
6. **Standalone output**: Frontend uses `output: 'standalone'` in next.config.ts — required for Docker
