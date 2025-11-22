# Kuma CLI (kumactl) Usage Guide

This guide shows you how to use the Kuma CLI to interact with your running Kuma demo.

## Setup

The `kumactl` CLI has been installed in the `kuma-demo/kuma-2.12.4/bin/` directory.

### Add to PATH (for current session)

```bash
cd kuma-demo
export PATH=$PATH:$(pwd)/kuma-2.12.4/bin
```

### Or use the helper script

```bash
cd kuma-demo
./kumactl-commands.sh
```

## Configure Control Plane

```bash
# Configure Global CP
kumactl config control-planes add \
  --name=local-global \
  --address=http://localhost:5681 \
  --overwrite

# Configure Zone CP (if needed)
kumactl config control-planes add \
  --name=local-zone \
  --address=http://localhost:5683 \
  --overwrite

# List configured control planes
kumactl config control-planes list

# Switch active control plane
kumactl config control-planes switch local-global
```

## Common Commands

### Inspect Resources

```bash
# Inspect all meshes
kumactl inspect meshes

# Inspect zones
kumactl inspect zones

# Inspect data planes
kumactl inspect dataplanes

# Inspect services
kumactl inspect services

# Inspect zone ingresses
kumactl inspect zoneingresses
```

### Get Resources

```bash
# Get all meshes
kumactl get meshes

# Get specific mesh
kumactl get mesh default

# Get policies
kumactl get meshtimeouts
kumactl get meshretries
kumactl get meshtrafficpermissions
kumactl get meshtls
```

### Apply Patterns

To apply the demo patterns, you'll need to use `kubectl` (for Kubernetes) or apply YAML files directly:

```bash
# Pattern 1: Global/Zone CP Separation
kubectl apply -f patterns/pattern1-global-zone-cp/

# Pattern 2: Multi-Zone Service Discovery
kubectl apply -f patterns/pattern2-multi-zone-discovery/

# Pattern 3: Delegated Gateway Pattern
kubectl apply -f patterns/pattern3-delegated-gateway/

# Pattern 4: Policy Priority Hierarchy
kubectl apply -f patterns/pattern4-policy-priority/
```

### View Applied Patterns

After applying patterns, inspect them:

```bash
# View zones (Pattern 1)
kumactl inspect zones

# View zone ingresses (Pattern 2)
kumactl inspect zoneingresses

# View mesh TLS configuration (Pattern 2)
kumactl get meshtls default

# View timeout policies (Pattern 4)
kumactl get meshtimeouts

# Inspect specific timeout policy
kumactl inspect meshtimeout platform-default-timeouts
```

### Output Formats

```bash
# Table format (default)
kumactl get meshes

# YAML format
kumactl get meshes -o yaml

# JSON format
kumactl get meshes -o json
```

## Example Workflow

### 1. Check Current State

```bash
# Set PATH
export PATH=$PATH:$(pwd)/kuma-2.12.4/bin

# Check meshes
kumactl inspect meshes

# Check zones
kumactl inspect zones
```

### 2. Apply Pattern 2 (Multi-Zone Service Discovery)

```bash
# Apply mTLS configuration
kubectl apply -f patterns/pattern2-multi-zone-discovery/mesh-mtls.yaml

# Verify mTLS is enabled
kumactl get meshtls default

# Apply zone ingress
kubectl apply -f patterns/pattern2-multi-zone-discovery/zone-ingress.yaml

# Verify zone ingress
kumactl inspect zoneingresses
```

### 3. Apply Pattern 4 (Policy Priority)

```bash
# Apply platform default
kubectl apply -f patterns/pattern4-policy-priority/platform-default-timeout.yaml

# Verify policy
kumactl get meshtimeouts
kumactl inspect meshtimeout platform-default-timeouts

# Apply application override
kubectl apply -f patterns/pattern4-policy-priority/application-override-timeout.yaml

# View all timeout policies
kumactl get meshtimeouts -o yaml
```

## Troubleshooting

### Version Warning

You may see a warning about version mismatch:
```
WARNING: You are using kumactl version 2.12.4 for Kuma, but the server returned version: Kong Mesh for 2.6.0
```

This is normal and doesn't affect functionality. The CLI is compatible with the server.

### Connection Issues

If you can't connect:

```bash
# Check if control plane is running
docker-compose ps

# Test API endpoint
curl http://localhost:5681

# Reconfigure control plane
kumactl config control-planes add \
  --name=local-global \
  --address=http://localhost:5681 \
  --overwrite
```

### Get Help

```bash
# General help
kumactl --help

# Command-specific help
kumactl inspect --help
kumactl get --help
kumactl config --help
```

## Quick Reference

| Command | Description |
|---------|-------------|
| `kumactl inspect meshes` | View all meshes and their status |
| `kumactl inspect zones` | View registered zones |
| `kumactl inspect dataplanes` | View all data planes |
| `kumactl get meshes` | Get mesh resources |
| `kumactl get meshtimeouts` | Get timeout policies |
| `kumactl config control-planes list` | List configured control planes |
| `kumactl config control-planes switch <name>` | Switch active control plane |

## Next Steps

1. Explore the GUI at http://localhost:5681
2. Apply pattern configurations using `kubectl`
3. Inspect applied patterns using `kumactl`
4. Read the [README.md](./README.md) for pattern details

