.PHONY: build run test clean docker docker-run lint fmt help

# Go parameters
GOCMD=go
GOBUILD=$(GOCMD) build
GORUN=$(GOCMD) run
GOTEST=$(GOCMD) test
GOGET=$(GOCMD) get
GOMOD=$(GOCMD) mod
GOFMT=gofmt
GOLINT=golangci-lint

# Binary
BINARY_NAME=scrum-poker-server
BINARY_PATH=./bin/$(BINARY_NAME)

# Docker
DOCKER_IMAGE=scrum-poker-backend
DOCKER_TAG=latest

## help: Show this help message
help:
	@echo "Scrum Poker Backend - Available Commands:"
	@echo ""
	@sed -n 's/^##//p' ${MAKEFILE_LIST} | column -t -s ':' | sed -e 's/^/ /'

## build: Build the binary
build:
	@echo "Building..."
	@mkdir -p bin
	$(GOBUILD) -o $(BINARY_PATH) ./cmd/server
	@echo "Build complete: $(BINARY_PATH)"

## run: Run the server
run:
	@echo "Starting server..."
	$(GORUN) ./cmd/server/main.go

## test: Run tests
test:
	@echo "Running tests..."
	$(GOTEST) -v -race ./...

## test-coverage: Run tests with coverage
test-coverage:
	@echo "Running tests with coverage..."
	$(GOTEST) -v -race -coverprofile=coverage.out ./...
	$(GOCMD) tool cover -html=coverage.out -o coverage.html
	@echo "Coverage report: coverage.html"

## clean: Clean build artifacts
clean:
	@echo "Cleaning..."
	@rm -rf bin/
	@rm -f coverage.out coverage.html
	@echo "Clean complete"

## deps: Download dependencies
deps:
	@echo "Downloading dependencies..."
	$(GOMOD) download
	$(GOMOD) tidy

## fmt: Format code
fmt:
	@echo "Formatting code..."
	$(GOFMT) -s -w .

## lint: Run linter
lint:
	@echo "Running linter..."
	$(GOLINT) run ./...

## docker: Build Docker image
docker:
	@echo "Building Docker image..."
	docker build -t $(DOCKER_IMAGE):$(DOCKER_TAG) .
	@echo "Docker image built: $(DOCKER_IMAGE):$(DOCKER_TAG)"

## docker-run: Run Docker container
docker-run:
	@echo "Running Docker container..."
	docker run -p 8080:8080 --rm $(DOCKER_IMAGE):$(DOCKER_TAG)

## docker-compose-up: Start with docker-compose
docker-compose-up:
	docker-compose up -d

## docker-compose-down: Stop docker-compose
docker-compose-down:
	docker-compose down

## dev: Run in development mode with hot reload (requires air)
dev:
	@which air > /dev/null || (echo "Installing air..." && go install github.com/air-verse/air@latest)
	air

# Default target
.DEFAULT_GOAL := help
