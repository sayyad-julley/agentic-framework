#!/bin/bash
# Script to apply demo resources using REST API
# This works around kumactl apply parsing issues

cd "$(dirname "$0")"
export PATH=$PATH:$(pwd)/kuma-2.12.4/bin

API_URL="http://localhost:5681"
MESH="default"

echo "Applying demo resources via REST API..."
echo ""

# 1. Apply Traffic Permission
echo "1. Applying MeshTrafficPermission..."
curl -s -X POST "${API_URL}/meshes/${MESH}/traffic-permissions" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "MeshTrafficPermission",
    "name": "allow-all-traffic",
    "mesh": "default",
    "spec": {
      "targetRef": {"kind": "Mesh"},
      "from": [{"targetRef": {"kind": "Mesh"}}]
    }
  }' > /dev/null && echo "   ✓ Traffic Permission applied" || echo "   ✗ Failed"

# 2. Apply Timeout Policy
echo "2. Applying MeshTimeout..."
curl -s -X POST "${API_URL}/meshes/${MESH}/timeouts" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "MeshTimeout",
    "name": "demo-timeout-policy",
    "mesh": "default",
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
  }' > /dev/null && echo "   ✓ Timeout Policy applied" || echo "   ✗ Failed"

# 3. Apply Retry Policy
echo "3. Applying MeshRetry..."
curl -s -X POST "${API_URL}/meshes/${MESH}/retries" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "MeshRetry",
    "name": "demo-retry-policy",
    "mesh": "default",
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
  }' > /dev/null && echo "   ✓ Retry Policy applied" || echo "   ✗ Failed"

# 4. Apply Circuit Breaker
echo "4. Applying MeshCircuitBreaker..."
curl -s -X POST "${API_URL}/meshes/${MESH}/circuit-breakers" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "MeshCircuitBreaker",
    "name": "demo-circuit-breaker",
    "mesh": "default",
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
  }' > /dev/null && echo "   ✓ Circuit Breaker applied" || echo "   ✗ Failed"

# 5. Apply Rate Limit
echo "5. Applying MeshRateLimit..."
curl -s -X POST "${API_URL}/meshes/${MESH}/rate-limits" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "MeshRateLimit",
    "name": "demo-rate-limit",
    "mesh": "default",
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
  }' > /dev/null && echo "   ✓ Rate Limit applied" || echo "   ✗ Failed"

# 6. Create Zone
echo "6. Creating Zone..."
curl -s -X POST "${API_URL}/zones" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "Zone",
    "name": "us-east",
    "spec": {
      "ingress": {
        "address": "10.0.1.100:10001"
      }
    }
  }' > /dev/null && echo "   ✓ Zone us-east created" || echo "   ✗ Failed"

# 7. Create another Zone
echo "7. Creating Zone eu-west..."
curl -s -X POST "${API_URL}/zones" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "Zone",
    "name": "eu-west",
    "spec": {
      "ingress": {
        "address": "10.0.2.100:10001"
      }
    }
  }' > /dev/null && echo "   ✓ Zone eu-west created" || echo "   ✗ Failed"

# 8. Create Dataplane
echo "8. Creating Dataplane..."
curl -s -X POST "${API_URL}/meshes/${MESH}/dataplanes" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "Dataplane",
    "name": "frontend-dp",
    "mesh": "default",
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
  }' > /dev/null && echo "   ✓ Dataplane frontend-dp created" || echo "   ✗ Failed"

# 9. Create more Dataplanes
echo "9. Creating Dataplane backend-dp..."
curl -s -X POST "${API_URL}/meshes/${MESH}/dataplanes" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "Dataplane",
    "name": "backend-dp",
    "mesh": "default",
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
  }' > /dev/null && echo "   ✓ Dataplane backend-dp created" || echo "   ✗ Failed"

echo "10. Creating Dataplane payment-dp..."
curl -s -X POST "${API_URL}/meshes/${MESH}/dataplanes" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "Dataplane",
    "name": "payment-dp",
    "mesh": "default",
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
  }' > /dev/null && echo "   ✓ Dataplane payment-dp created" || echo "   ✗ Failed"

echo ""
echo "=== Summary ==="
echo "Checking applied resources..."
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
echo "  Traffic Permissions:"
kumactl get meshtrafficpermissions
echo "  Timeouts:"
kumactl get meshtimeouts | grep -v "mesh-timeout-all-default\|mesh-gateways"
echo "  Retries:"
kumactl get meshretries | grep -v "mesh-retry-all-default"
echo "  Circuit Breakers:"
kumactl get meshcircuitbreakers | grep -v "mesh-circuit-breaker-all-default"
echo "  Rate Limits:"
kumactl get meshratelimits

