# Multi-stage Docker build for musl/glibc compatibility
# Build stage: Full-featured environment
FROM python:3.11-slim as builder
WORKDIR /app
COPY requirements.txt .
RUN pip install --user --no-cache-dir -r requirements.txt

# Runtime stage: Minimal Alpine with only runtime dependencies
FROM python:3.11-alpine
RUN apk add --no-cache python3 py3-pip
COPY --from=builder /root/.local /root/.local
ENV PATH=/root/.local/bin:$PATH

WORKDIR /app
COPY src/ ./src/
CMD ["python", "src/examples/main.py"]

