# MarketMind — AI-Powered Financial Intelligence Dashboard

A full-stack financial dashboard that combines real-time market data, AI-driven analysis, and portfolio tracking into a single, production-ready application.

![Go](https://img.shields.io/badge/Go-1.24-00ADD8?logo=go&logoColor=white)
![Next.js](https://img.shields.io/badge/Next.js-15-000000?logo=next.js&logoColor=white)
![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?logo=docker&logoColor=white)
![Tests](https://img.shields.io/badge/Tests-38_passing-brightgreen)

---

## Features

| Feature                   | Description                                                                         |
| ------------------------- | ----------------------------------------------------------------------------------- |
| **Real-Time Market Data** | Stock quotes, market indices (S&P 500, NASDAQ, NIFTY 50) with 1-minute auto-refresh |
| **AI Market Sentiment**   | Gemini-powered bullish/bearish/neutral analysis with live news grounding            |
| **Deep Ticker Analysis**  | Gemini Pro with high-reasoning for Bull/Bear/Risk breakdown per stock               |
| **AI Chat Interface**     | Conversational market Q&A with Markdown-rendered responses                          |
| **Live News Feed**        | AI-enriched news with sentiment tagging and category classification                 |
| **Portfolio Management**  | Client-side watchlist with localStorage persistence                                 |
| **WebSocket Updates**     | Real-time news push with exponential backoff reconnection                           |
| **Never-Fail Resilience** | Primary API → scraper fallback → AI-generated content (always 200 OK)               |

---

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                     Frontend (Next.js 15)                │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌────────────┐ │
│  │Dashboard │ │ News Tab │ │Portfolio │ │Analysis/   │ │
│  │   Tab    │ │          │ │   Tab    │ │  Chat Tab  │ │
│  └────┬─────┘ └────┬─────┘ └────┬─────┘ └─────┬──────┘ │
│       │REST         │REST        │REST         │REST     │
│       │             │            │             │         │
│  ┌────┴─────────────┴────────────┴─────────────┴──────┐ │
│  │           ErrorBoundary + WebSocket Hook            │ │
│  └────────────────────────┬───────────────────────────┘ │
└───────────────────────────┼─────────────────────────────┘
                            │ HTTP / WebSocket
┌───────────────────────────┼─────────────────────────────┐
│                     Backend (Go + Gin)                   │
│  ┌────────────────────────┴───────────────────────────┐ │
│  │              Middleware Layer                       │ │
│  │  RequestID · JWT Auth · CORS · Graceful Shutdown   │ │
│  └────────────────────────┬───────────────────────────┘ │
│  ┌────────────────────────┴───────────────────────────┐ │
│  │              Handler Layer                         │ │
│  │  Quotes · News · Indices · Sentiment · Analysis    │ │
│  └────────┬───────────────┬───────────────┬───────────┘ │
│  ┌────────┴──────┐ ┌──────┴──────┐ ┌──────┴──────┐     │
│  │ Services      │ │  Scraper    │ │  WebSocket  │     │
│  │ GeminiClient  │ │  (Google    │ │  Broadcast  │     │
│  │ TTLCache[T]   │ │   Finance)  │ │  Loop       │     │
│  └───────────────┘ └─────────────┘ └─────────────┘     │
└─────────────────────────────────────────────────────────┘
         │                    │
    Gemini API          Finnhub / NewsAPI
```

### Data Flow — "Never-Fail" Pattern

Every data pipeline uses layered fallbacks to ensure the user always gets a response:

```
Stock Quotes:   Finnhub API  →  Google Finance Scraper  →  cached data
Market News:    NewsAPI      →  Google Finance Scraper  →  Gemini-generated summary
Sentiment:      Live scrape  →  Gemini Search Grounding →  neutral default
```

---

## Tech Stack

### Backend

- **Language**: Go 1.24
- **Framework**: Gin (HTTP), gorilla/websocket (WebSocket)
- **AI**: Google Gemini API (Flash for speed, Pro for deep reasoning)
- **Auth**: JWT (golang-jwt/v5) with crypto/rand fallback secret
- **Scraping**: goquery (Google Finance HTML parsing)
- **Caching**: Generic `TTLCache[T]` with concurrent-safe RWMutex
- **Testing**: 38 tests across 3 packages (services, middleware, handlers)

### Frontend

- **Framework**: Next.js 15 (App Router, standalone output)
- **UI**: React 19, TypeScript 5, Tailwind CSS 4
- **Components**: shadcn/ui (Radix primitives), Lucide icons
- **State**: React hooks + localStorage persistence
- **Real-time**: Custom `useWebSocket` hook with exponential backoff

### Infrastructure

- **Containers**: Multi-stage Dockerfiles (distroless Go, Alpine Node)
- **Orchestration**: Docker Compose with health checks
- **Build**: Makefile with dev/build/test/docker targets

---

## Quick Start

### Prerequisites

- Go 1.24+
- Node.js 20+
- Docker & Docker Compose (optional)

### Option 1 — Docker (recommended)

```bash
# 1. Clone and set up environment
cp .env.example .env
# Edit .env with your API keys

# 2. Start everything
make docker-up

# 3. Open http://localhost:3000
```

### Option 2 — Local Development

```bash
# Backend (terminal 1)
cd marketmind-backend
cp ../.env.example ../.env  # Set API keys
go run main.go

# Frontend (terminal 2)
cd marketmind-frontend
npm install
npm run dev

# Open http://localhost:3000
```

### Environment Variables

```bash
GEMINI_API_KEY=xxx          # Required — powers all AI features
FINNHUB_API_KEY=xxx         # Stock quotes (has scraper fallback)
NEWSAPI_KEY=xxx             # News feed (has scraper fallback)
JWT_SECRET=xxx              # Auto-generated if not set (dev-safe)
CORS_ORIGINS=http://localhost:3000  # Comma-separated allowed origins
PORT=8080                   # Backend port
```

---

## Project Structure

```
MarketMind/
├── docker-compose.yml          # Multi-service orchestration
├── Makefile                    # Build/test/run automation
├── .env.example                # Environment variable template
│
├── marketmind-backend/
│   ├── main.go                 # Entry point, graceful shutdown, route registration
│   ├── Dockerfile              # Multi-stage distroless build
│   ├── handlers/               # HTTP handlers (one file per domain)
│   │   ├── analysis.go         # Deep AI ticker analysis (Gemini Pro)
│   │   ├── finnhub.go          # Stock quote fetching + scraper fallback
│   │   ├── indices.go          # Market indices (US + India)
│   │   ├── news.go             # News aggregation + ticker search
│   │   ├── newsapi.go          # NewsAPI integration + AI enrichment
│   │   ├── scraper.go          # Google Finance HTML scraper
│   │   ├── sentiment.go        # AI market sentiment analysis
│   │   ├── websocket.go        # WebSocket connection management
│   │   ├── portfolio.go        # Portfolio update handler
│   │   ├── common.go           # Shared JWT init + helpers
│   │   └── handlers_test.go    # 8 handler tests
│   ├── services/               # Shared business logic
│   │   ├── gemini.go           # Centralized Gemini API client
│   │   ├── cache.go            # Generic TTLCache[T] implementation
│   │   ├── gemini_test.go      # 10 Gemini client tests
│   │   └── cache_test.go       # 11 cache tests
│   ├── middleware/              # HTTP middleware
│   │   ├── auth.go             # JWT auth + Request ID middleware
│   │   └── middleware_test.go  # 9 middleware tests
│   └── models/
│       └── models.go           # Shared types (NewsItem, Claims)
│
├── marketmind-frontend/
│   ├── Dockerfile              # Multi-stage Next.js standalone build
│   ├── next.config.ts          # Standalone output, API proxy rewrites
│   └── src/
│       ├── app/
│       │   ├── page.tsx        # Dashboard orchestrator (data fetching + routing)
│       │   ├── layout.tsx      # Root layout with Inter font
│       │   └── globals.css     # Tailwind imports
│       ├── components/
│       │   ├── tabs/           # Tab-level page components
│       │   │   ├── DashboardTab.tsx
│       │   │   ├── NewsTab.tsx
│       │   │   ├── PortfolioTab.tsx
│       │   │   ├── AnalysisTab.tsx
│       │   │   └── ChatTab.tsx
│       │   ├── ErrorBoundary.tsx # React error boundary
│       │   ├── Header.tsx
│       │   ├── Sidebar.tsx
│       │   ├── StockCard.tsx
│       │   ├── NewsCardV2.tsx
│       │   ├── PortfolioAlerts.tsx  # Live alerts from portfolio data
│       │   ├── TickerSearch.tsx     # Debounced autocomplete search
│       │   ├── MarketNews.tsx       # AI-generated market brief
│       │   ├── AnalysisDialog.tsx
│       │   └── ui/                  # shadcn/ui primitives
│       ├── hooks/
│       │   └── useWebSocket.ts  # WebSocket with exponential backoff
│       └── lib/
│           └── utils.ts         # Tailwind merge utility
```

---

## API Reference

| Endpoint                              | Method | Auth   | Description                            |
| ------------------------------------- | ------ | ------ | -------------------------------------- |
| `GET /health`                         | GET    | No     | Health check (`{"status":"ok"}`)       |
| `GET /api/quotes?tickers=AAPL,GOOGL`  | GET    | No     | Stock quotes with scraper fallback     |
| `GET /api/market-indices?region=US`   | GET    | No     | Market indices (S&P 500, NASDAQ, etc.) |
| `GET /api/market-sentiment?region=US` | GET    | No     | AI-powered market sentiment analysis   |
| `GET /api/market-news`                | GET    | No     | AI-generated market news summary       |
| `GET /api/search-tickers?q=AA`        | GET    | No     | Ticker autocomplete (30+ tickers)      |
| `GET /api/news`                       | GET    | Bearer | Personalized AI-enriched news feed     |
| `POST /api/analyze-ticker`            | POST   | Bearer | Deep AI analysis (`{"ticker":"AAPL"}`) |
| `POST /api/user/update-portfolio`     | POST   | Bearer | Save portfolio to JWT                  |
| `WS /ws?token=xxx`                    | WS     | Query  | Real-time news stream (60s broadcasts) |

---

## Testing

```bash
# Run all 38 backend tests
make test

# With coverage report
make test-coverage

# Run specific package
cd marketmind-backend && go test ./services/... -v
```

**Test coverage:**

- `services/` — 21 tests (TTLCache: 11, GeminiClient: 10)
- `middleware/` — 9 tests (JWT auth: 5, RequestID: 2, context helpers: 2)
- `handlers/` — 8 tests (SearchTickers: 4, Portfolio: 2, Analysis: 2, News: 2)

---

## Key Engineering Decisions

| Decision                       | Rationale                                                                                 |
| ------------------------------ | ----------------------------------------------------------------------------------------- |
| Generic `TTLCache[T]`          | Type-safe caching with Go generics — replaces 5 inconsistent cache implementations        |
| Centralized `GeminiClient`     | Single HTTP client with safe type assertions — eliminates 6× duplicated API call patterns |
| Distroless Docker image        | Minimal attack surface (no shell, no package manager) — ~15MB final image                 |
| Exponential backoff WebSocket  | Jittered retry (1s→30s cap, 5 max) prevents thundering herd on reconnection               |
| `React.memo` on tab components | Prevents re-renders when switching tabs (dashboard state preserved)                       |
| Standalone Next.js output      | Minimal production image without `node_modules` (~100MB vs ~500MB)                        |
| Never-Fail pattern             | Every external API call has a fallback chain — zero user-facing errors                    |

---

## Development

```bash
make help             # Show all available commands
make dev-backend      # Start Go backend
make dev-frontend     # Start Next.js with Turbopack
make build            # Build both services
make test             # Run backend test suite
make lint             # Lint both services
make docker-up        # Start with Docker Compose
make docker-down      # Stop Docker services
make docker-logs      # Tail logs
```

---

## License

MIT
