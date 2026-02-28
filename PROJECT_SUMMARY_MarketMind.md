# MarketMind V2 — AI-Powered Financial Intelligence Dashboard

## 1) Project Title

**MarketMind V2: Real-Time, Resilient Market Intelligence Platform**

## 2) One-line Impact Statement

Engineered a dual-service Go + Next.js platform that delivers AI-enriched financial insights with multi-layer fallback architecture, reducing hard-failure risk to near-zero at the API layer while supporting real-time portfolio news updates every 60 seconds.

## 3) Problem Statement

Retail investors typically consume fragmented market data (prices, headlines, and sentiment) across disconnected tools, causing delayed and low-confidence decisions.
MarketMind consolidates real-time quotes, personalized portfolio news, and AI analysis in one interface.
The system is explicitly designed for reliability under API failures, rate limits, and scraping volatility.

## 4) Technical Architecture Overview

- **Monorepo architecture** with clear service boundaries:
  - `marketmind-backend/` (Go + Gin REST + WebSocket, port `8080`)
  - `marketmind-frontend/` (Next.js 15 + React 19 UI, port `3000`)
- **Hybrid retrieval pipeline** for market data:
  - Quotes: Finnhub API → Google Finance scraper fallback (`handlers/finnhub.go`, `handlers/scraper.go`)
  - News: NewsAPI → Google Finance news scrape → system fallback message (`handlers/newsapi.go`)
  - Sentiment/indices: scraper-first with Gemini fallback (`handlers/sentiment.go`, `handlers/indices.go`)
- **Real-time channel** via authenticated WebSocket (`/ws?token=<jwt>`), where connected clients receive portfolio-scoped updates in a server loop every 60s (`handlers/websocket.go`).
- **State and personalization model**:
  - Portfolio encoded in JWT claims and refreshed via `/api/user/update-portfolio`
  - Frontend decodes token, persists in `localStorage`, merges REST baseline + WebSocket stream (`src/components/MarketMind.tsx`).

## 5) Tech Stack

- **Languages**: Go, TypeScript, JavaScript, SQL (none in current code), HTML/CSS (Tailwind utility layer)
- **Backend Frameworks/Libraries**: Gin, Gorilla WebSocket, JWT v5, goquery, gin-contrib/cors, godotenv
- **Frontend Frameworks/Libraries**: Next.js 15, React 19, Tailwind CSS, shadcn/ui (Radix), Framer Motion, `jwt-decode`, `react-markdown`
- **AI/LLM Integration**: Google Gemini API (`gemini-3-flash-preview`, `gemini-3-pro-preview`)
- **External APIs/Data Providers**: Finnhub, NewsAPI, Google Finance pages (scraped)
- **Auth/Security**: JWT bearer auth for protected endpoints + tokenized WebSocket handshake
- **Deployment/Runtime**: Local dev via `go run main.go` + `next dev --turbopack`; CORS configured for `http://localhost:3000`

## 6) Key Features

- Personalized portfolio management backed by signed JWT claims (`24h` expiry).
- AI-enriched news feed with sentiment/category classification and structured JSON output.
- Real-time portfolio news streaming over WebSocket with server-managed client registry.
- Market sentiment endpoint with score (`-1.0` to `1.0`), label, and rationale.
- Deep ticker analysis using higher-reasoning Gemini model and markdown-formatted output.
- Ticker autocomplete with debounced search (300ms) for reduced noisy network calls.
- Region-aware market index retrieval (US/India) with resilient scraping strategy.

## 7) Technical Highlights

- **Resilience pattern**: Implemented layered fallback chains instead of single-source dependencies, returning usable `200 OK` payloads even under upstream failures.
- **Concurrency-safe caching**: Designed lock-protected in-memory caches with explicit TTLs:
  - Quotes: `1 min`
  - News scrape cache: `5 min`
  - Indices cache: `5 min`
  - Sentiment cache: `15 min`
- **Rate-limit mitigation**: Combined caching + source fallback to reduce exposure to Finnhub free-tier limits (`60 calls/min`) and NewsAPI daily caps.
- **Streaming design**: Used copy-on-read pattern for WebSocket client map to minimize lock contention during broadcast writes.
- **Prompt/response engineering**: Enforced schema-guided JSON generation and deterministic extraction path (`candidates[0].content.parts[0].text`) for robust parsing.
- **Frontend data fusion**: Deduplicated combined REST + WebSocket items using hash key (`ticker + title`) before tab filtering.

## 8) Performance Metrics (Code-Derived)

- **Push cadence**: WebSocket broadcaster emits updates every **60s**.
- **Cache windows**: up to **15 minutes** for sentiment, reducing repeated heavy inference/scraping calls.
- **News processing limit**: top **6** articles enriched per request in hybrid news flow.
- **Ticker query optimization**: **300ms debounce** reduces redundant autocomplete requests during typing bursts.
- **HTTP timeout hardening**: key outbound calls bounded to **5s, 10s, or 15s** depending on endpoint path.
- **Operational reliability target (architectural)**: multi-tier fallback on critical data paths, eliminating hard dependency on any single provider.

## 9) Real-world Use Case

A retail investor tracking 5–10 equities can monitor live portfolio-relevant news, receive AI-generated sentiment cues, and request deep per-ticker analysis in one dashboard—even during third-party API outages or rate-limit events.

## 10) What Makes This Project Advanced

- Integrates **real-time systems**, **LLM orchestration**, **web scraping fallbacks**, and **JWT-based personalization** in one cohesive product.
- Demonstrates production-style reliability thinking (graceful degradation, bounded latencies, cache TTL strategy) rather than demo-only happy paths.
- Balances fast inference (`gemini-3-flash-preview`) and deep reasoning (`gemini-3-pro-preview`) by endpoint workload profile.
- Implements cross-service coordination (token lifecycle, WebSocket auth, stream + REST merge) with minimal infrastructure overhead.

## 11) Future Improvements (Engineering-Focused)

- Replace in-memory caches with Redis for multi-instance horizontal scaling and shared state.
- Add connection heartbeats/retry backoff and reconnection policy to strengthen WebSocket session durability.
- Introduce observability stack (OpenTelemetry metrics, traces, structured logs, error budgets/SLOs).
- Externalize secrets and hardcoded API-key fallbacks; enforce secret scanning and environment-specific config.
- Add automated test suites:
  - Go handler tests (`*_test.go`) with mocked upstream APIs
  - Frontend integration tests for REST/WebSocket merge behavior
- Implement CI/CD pipeline (lint, type-check, tests, build, container publish).
- Standardize endpoint parity (e.g., frontend uses `/api/market-news`; ensure route is registered and monitored).

## 12) Resume-Ready Bullet Points

- Built a resilient market-intelligence platform using **Go (Gin) + Next.js 15**, integrating REST + WebSocket delivery to provide authenticated, portfolio-aware financial updates in near real time.
- Engineered multi-layer fallback pipelines (API → scraper → safe response) across quotes/news/sentiment flows, improving service continuity under third-party outages and rate limits.
- Implemented concurrency-safe TTL caches (1/5/15-minute windows) that reduced repeated external calls and stabilized latency for high-frequency dashboard refresh patterns.
- Designed and integrated LLM workflows with **Gemini 3 Flash/Pro**, including schema-constrained JSON outputs for sentiment classification and high-depth markdown stock analysis.
- Developed JWT-based personalization with 24-hour claims lifecycle and token-authenticated WebSocket channels (`/ws?token=...`) for secure real-time portfolio broadcasting every 60 seconds.
- Optimized frontend UX with debounced ticker search (300ms), stream+REST deduplication, and componentized shadcn-based interfaces to maintain responsive interaction under live data churn.

## 13) Suggested Project Specialisation Tags

- Backend Systems
- Real-Time Systems
- AI/LLM Applications
- Financial Technology (FinTech)
- Full-Stack Engineering
- API Engineering
- Resilient Distributed Design
- Web Scraping & Data Pipelines
- Applied Prompt Engineering
