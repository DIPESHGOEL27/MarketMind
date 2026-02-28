.PHONY: dev dev-backend dev-frontend build test lint docker-up docker-down clean help

# ─── Development ──────────────────────────────────────────────
dev-backend: ## Start Go backend (hot reload with go run)
	cd marketmind-backend && go run main.go

dev-frontend: ## Start Next.js frontend (Turbopack)
	cd marketmind-frontend && npm run dev

dev: ## Start both services (requires two terminals — use docker-up for single command)
	@echo "Run 'make dev-backend' and 'make dev-frontend' in separate terminals"
	@echo "Or use 'make docker-up' to start everything with Docker"

# ─── Build ────────────────────────────────────────────────────
build-backend: ## Build Go binary
	cd marketmind-backend && CGO_ENABLED=0 go build -ldflags="-s -w" -o bin/marketmind-api .

build-frontend: ## Build Next.js production bundle
	cd marketmind-frontend && npm run build

build: build-backend build-frontend ## Build both services

# ─── Testing ──────────────────────────────────────────────────
test: ## Run all backend tests
	cd marketmind-backend && go test ./... -v -count=1

test-coverage: ## Run tests with coverage report
	cd marketmind-backend && go test ./... -coverprofile=coverage.out && go tool cover -html=coverage.out -o coverage.html

lint-backend: ## Run Go vet
	cd marketmind-backend && go vet ./...

lint-frontend: ## Run Next.js lint
	cd marketmind-frontend && npm run lint

lint: lint-backend lint-frontend ## Lint both services

# ─── Docker ───────────────────────────────────────────────────
docker-up: ## Start all services with Docker Compose
	docker compose up --build -d

docker-down: ## Stop all Docker services
	docker compose down

docker-logs: ## Tail Docker Compose logs
	docker compose logs -f

# ─── Utilities ────────────────────────────────────────────────
clean: ## Remove build artifacts
	rm -rf marketmind-backend/bin
	rm -rf marketmind-frontend/.next
	rm -rf marketmind-frontend/node_modules/.cache

install: ## Install all dependencies
	cd marketmind-backend && go mod download
	cd marketmind-frontend && npm install

help: ## Show this help
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-20s\033[0m %s\n", $$1, $$2}'

.DEFAULT_GOAL := help
