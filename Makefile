.PHONY: mock
mock:
	docker run --rm -i -v ${PWD}:/src -w /src vektra/mockery:3.6

.PHONY: lint
lint:
	docker run --rm -i -v ${PWD}:/src -w /src golangci/golangci-lint:v2.8.0-alpine golangci-lint run ./...

.PHONY: lint-fix
lint-fix:
	docker run --rm -i -v ${PWD}:/src -w /src golangci/golangci-lint:v2.8.0-alpine golangci-lint run --fix ./...

.PHONY: test
test:
	docker run --rm -i -v ${PWD}:/src -w /src golang:1.25.5 go test ./...
