#!/bin/bash
# Apply resources using the correct GUI API endpoints

cd "$(dirname "$0")"
export PATH=$PATH:$(pwd)/kuma-2.12.4/bin

API_BASE="http://localhost:5681/api/v1"
MESH="default"

echo "Applying demo resources via GUI API..."
echo ""

# Traffic Permission
echo "1. Creating MeshTrafficPermission..."
RESPONSE=$(curl -s -X POST "${API_BASE}/meshes/${MESH}/traffic-permissions" \
  -H "Content-Type: application/json" \
  -d '{
    "mesh": "default",
    "name": "allow-all-traffic",
    "type": "MeshTrafficPermission",
    "spec": {
      "targetRef": {"kind": "Mesh"},
      "from": [{"targetRef": {"kind": "Mesh"}}]
    }
  }')
if echo "$RESPONSE" | grep -q "allow-all-traffic" || [ -z "$RESPONSE" ]; then
  echo "   ✓ Traffic Permission created"
else
  echo "   ✗ Failed: $RESPONSE"
fi

# Timeout Policy
echo "2. Creating MeshTimeout..."
RESPONSE=$(curl -s -X POST "${API_BASE}/meshes/${MESH}/timeouts" \
  -H "Content-Type: application/json" \
  -d '{
    "mesh": "default",
    "name": "demo-timeout-policy",
    "type": "MeshTimeout",
    "spec": {
      "targetRef": {"kind": "Mesh"},
      "to": [{
        "targetRef": {"kind": "Mesh"},
        "default": {
          "connectionTimeout": "5s",
          "http": {"requestTimeout": "15s"}
        }
      }]
    }
  }')
if echo "$RESPONSE" | grep -q "demo-timeout-policy" || [ -z "$RESPONSE" ]; then
  echo "   ✓ Timeout Policy created"
else
  echo "   ✗ Failed: $RESPONSE"
fi

# Retry Policy
echo "3. Creating MeshRetry..."
RESPONSE=$(curl -s -X POST "${API_BASE}/meshes/${MESH}/retries" \
  -H "Content-Type: application/json" \
  -d '{
    "mesh": "default",
    "name": "demo-retry-policy",
    "type": "MeshRetry",
    "spec": {
      "targetRef": {"kind": "Mesh"},
      "to": [{
        "targetRef": {"kind": "Mesh"},
        "default": {
          "http": {
            "numRetries": 3,
            "perTryTimeout": "5s"
          }
        }
      }]
    }
  }')
if echo "$RESPONSE" | grep -q "demo-retry-policy" || [ -z "$RESPONSE" ]; then
  echo "   ✓ Retry Policy created"
else
  echo "   ✗ Failed: $RESPONSE"
fi

# Circuit Breaker
echo "4. Creating MeshCircuitBreaker..."
RESPONSE=$(curl -s -X POST "${API_BASE}/meshes/${MESH}/circuit-breakers" \
  -H "Content-Type: application/json" \
  -d '{
    "mesh": "default",
    "name": "demo-circuit-breaker",
    "type": "MeshCircuitBreaker",
    "spec": {
      "targetRef": {"kind": "Mesh"},
      "to": [{
        "targetRef": {"kind": "Mesh"},
        "default": {
          "intervals": [{
            "maxConnections": 100,
            "maxPendingRequests": 50
          }]
        }
      }]
    }
  }')
if echo "$RESPONSE" | grep -q "demo-circuit-breaker" || [ -z "$RESPONSE" ]; then
  echo "   ✓ Circuit Breaker created"
else
  echo "   ✗ Failed: $RESPONSE"
fi

# Rate Limit
echo "5. Creating MeshRateLimit..."
RESPONSE=$(curl -s -X POST "${API_BASE}/meshes/${MESH}/rate-limits" \
  -H "Content-Type: application/json" \
  -d '{
    "mesh": "default",
    "name": "demo-rate-limit",
    "type": "MeshRateLimit",
    "spec": {
      "targetRef": {"kind": "Mesh"},
      "from": [{
        "targetRef": {"kind": "Mesh"},
        "default": {
          "local": {
            "http": {
              "requests": 100,
              "interval": "1s"
            }
          }
        }
      }]
    }
  }')
if echo "$RESPONSE" | grep -q "demo-rate-limit" || [ -z "$RESPONSE" ]; then
  echo "   ✓ Rate Limit created"
else
  echo "   ✗ Failed: $RESPONSE"
fi

# Zone (using zones endpoint)
echo "6. Creating Zone us-east..."
RESPONSE=$(curl -s -X POST "${API_BASE}/zones" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "us-east",
    "type": "Zone",
    "spec": {
      "ingress": {
        "address": "10.0.1.100:10001"
      }
    }
  }')
if echo "$RESPONSE" | grep -q "us-east" || [ -z "$RESPONSE" ]; then
  echo "   ✓ Zone us-east created"
else
  echo "   ✗ Failed: $RESPONSE"
fi

echo "7. Creating Zone eu-west..."
RESPONSE=$(curl -s -X POST "${API_BASE}/zones" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "eu-west",
    "type": "Zone",
    "spec": {
      "ingress": {
        "address": "10.0.2.100:10001"
      }
    }
  }')
if echo "$RESPONSE" | grep -q "eu-west" || [ -z "$RESPONSE" ]; then
  echo "   ✓ Zone eu-west created"
else
  echo "   ✗ Failed: $RESPONSE"
fi

# Dataplane
echo "8. Creating Dataplane frontend-dp..."
RESPONSE=$(curl -s -X POST "${API_BASE}/meshes/${MESH}/dataplanes" \
  -H "Content-Type: application/json" \
  -d '{
    "mesh": "default",
    "name": "frontend-dp",
    "type": "Dataplane",
    "spec": {
      "networking": {
        "address": "192.168.1.10",
        "inbound": [{
          "port": 8080,
          "servicePort": 80,
          "tags": {
            "kuma.io/service": "frontend",
            "kuma.io/protocol": "http"
          }
        }]
      }
    }
  }')
if echo "$RESPONSE" | grep -q "frontend-dp" || [ -z "$RESPONSE" ]; then
  echo "   ✓ Dataplane frontend-dp created"
else
  echo "   ✗ Failed: $RESPONSE"
fi

echo "9. Creating Dataplane backend-dp..."
RESPONSE=$(curl -s -X POST "${API_BASE}/meshes/${MESH}/dataplanes" \
  -H "Content-Type: application/json" \
  -d '{
    "mesh": "default",
    "name": "backend-dp",
    "type": "Dataplane",
    "spec": {
      "networking": {
        "address": "192.168.1.20",
        "inbound": [{
          "port": 8080,
          "servicePort": 80,
          "tags": {
            "kuma.io/service": "backend",
            "kuma.io/protocol": "http"
          }
        }]
      }
    }
  }')
if echo "$RESPONSE" | grep -q "backend-dp" || [ -z "$RESPONSE" ]; then
  echo "   ✓ Dataplane backend-dp created"
else
  echo "   ✗ Failed: $RESPONSE"
fi

echo "10. Creating Dataplane payment-dp..."
RESPONSE=$(curl -s -X POST "${API_BASE}/meshes/${MESH}/dataplanes" \
  -H "Content-Type: application/json" \
  -d '{
    "mesh": "default",
    "name": "payment-dp",
    "type": "Dataplane",
    "spec": {
      "networking": {
        "address": "192.168.1.30",
        "inbound": [{
          "port": 8080,
          "servicePort": 80,
          "tags": {
            "kuma.io/service": "payment",
            "kuma.io/protocol": "http"
          }
        }]
      }
    }
  }')
if echo "$RESPONSE" | grep -q "payment-dp" || [ -z "$RESPONSE" ]; then
  echo "   ✓ Dataplane payment-dp created"
else
  echo "   ✗ Failed: $RESPONSE"
fi

echo ""
echo "=== Verification ==="
sleep 2
echo ""
echo "Meshes:"
kumactl inspect meshes
echo ""
echo "Zones:"
kumactl inspect zones
echo ""
echo "Dataplanes:"
kumactl inspect dataplanes
echo ""
echo "Policies:"
echo "Traffic Permissions:"
kumactl get meshtrafficpermissions
echo "Timeouts:"
kumactl get meshtimeouts | grep -v "mesh-timeout-all-default\|mesh-gateways"
echo "Retries:"
kumactl get meshretries | grep -v "mesh-retry-all-default"
echo "Circuit Breakers:"
kumactl get meshcircuitbreakers | grep -v "mesh-circuit-breaker-all-default"
echo "Rate Limits:"
kumactl get meshratelimits

