# Build stage
FROM golang:1.25-alpine AS builder

WORKDIR /app

# Install dependencies
RUN apk add --no-cache git ca-certificates

# Copy go mod files
COPY go.mod go.sum ./
RUN go mod download

# Copy source code
COPY . .

# Build binary
RUN CGO_ENABLED=0 GOOS=linux go build -ldflags="-w -s" -o /server ./cmd/server
# ------
# Runtime stage
FROM gcr.io/distroless/static-debian12

WORKDIR /app

# Copy binary from builder
COPY --from=builder /server /app/server

# Expose port
EXPOSE 8080

# Run server
CMD ["/app/server"]
