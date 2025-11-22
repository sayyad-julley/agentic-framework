.PHONY: help opa-start opa-stop opa-health opa-test load-policies test build run clean

help: ## Show this help message
	@echo "Available targets:"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "  %-15s %s\n", $$1, $$2}'

opa-start: ## Start OPA server with Docker Compose
	docker-compose up -d opa
	@echo "Waiting for OPA to be ready..."
	@sleep 3
	@make opa-health

opa-stop: ## Stop OPA server
	docker-compose stop opa

opa-health: ## Check OPA server health
	@curl -s http://localhost:8181/health | jq '.' || echo "OPA server not responding"

load-policies: ## Load policies and data into OPA
	@echo "Loading RBAC policy..."
	@curl -X PUT http://localhost:8181/v1/policies/rbac \
		--data-binary @policies/rbac.rego \
		--silent --output /dev/null --write-out "Status: %{http_code}\n"
	@echo "Loading resource RBAC policy..."
	@curl -X PUT http://localhost:8181/v1/policies/rbac_resource \
		--data-binary @policies/rbac_with_resource.rego \
		--silent --output /dev/null --write-out "Status: %{http_code}\n"
	@echo "Loading multi-tenant RBAC policy..."
	@curl -X PUT http://localhost:8181/v1/policies/multi_tenant_rbac \
		--data-binary @policies/multi_tenant_rbac.rego \
		--silent --output /dev/null --write-out "Status: %{http_code}\n"
	@echo "Loading roles data..."
	@curl -X PUT http://localhost:8181/v1/data/roles_map \
		--data-binary @data/roles.json \
		--silent --output /dev/null --write-out "Status: %{http_code}\n"
	@echo "Policies and data loaded successfully!"

opa-test: ## Run OPA Rego tests
	@echo "Running OPA tests..."
	@docker run --rm -v $(PWD):/workspace openpolicyagent/opa:latest \
		test /workspace/tests/rbac_test.rego -v || true

test: ## Run all tests (OPA + Spring Boot)
	@make opa-test
	@echo "Running Spring Boot tests..."
	@mvn test

build: ## Build Spring Boot application
	mvn clean package -DskipTests

run: ## Run Spring Boot application
	mvn spring-boot:run

clean: ## Clean build artifacts
	mvn clean
	docker-compose down -v

test-auth: ## Test authorization endpoint (requires JWT token)
	@echo "Testing authorization..."
	@echo "Usage: make test-auth TOKEN=your-jwt-token"
	@if [ -z "$(TOKEN)" ]; then \
		echo "Error: TOKEN variable required"; \
		exit 1; \
	fi
	@curl -X POST "http://localhost:8080/api/authz/check?action=read" \
		-H "Authorization: Bearer $(TOKEN)" \
		-H "Content-Type: application/json" | jq '.'

