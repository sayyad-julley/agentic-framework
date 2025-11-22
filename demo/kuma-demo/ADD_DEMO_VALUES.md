# How to Add Demo Values to See Non-Zero Counts

## Quick Answer: Use the GUI

The **easiest and most reliable way** to add resources is through the Kuma GUI:

1. **Open**: http://localhost:5681
2. **Login**: Default is `admin` / `admin` (or check container logs for token)
3. **Create Resources**: Use the GUI interface to create policies

## Why Zeros Show Up

The `kumactl inspect meshes` command shows:
- **Custom policies only** (not default system policies)
- **Connected data planes only** (not just definitions)
- **Active zones only** (zones with connected Zone CPs)

## What Actually Exists

Even with zeros, these resources exist:

```bash
# Default policies (don't count in inspection)
kumactl get meshtimeouts      # Shows 2 default timeout policies
kumactl get meshretries        # Shows 1 default retry policy  
kumactl get meshcircuitbreakers # Shows 1 default circuit breaker

# Mesh exists
kumactl get meshes             # Shows default mesh
```

## To See Non-Zero Values

### Option 1: Create Policies via GUI (Recommended)

1. Open http://localhost:5681
2. Navigate to Policies section
3. Create new policies:
   - Traffic Permission
   - Timeout Policy
   - Retry Policy
   - Circuit Breaker
   - Rate Limit

These will show up in `kumactl inspect meshes`

### Option 2: Use kumactl (if YAML parsing works)

Try applying individual policy files:

```bash
cd kuma-demo
export PATH=$PATH:$(pwd)/kuma-2.12.4/bin

# Try applying a simple policy
cat > /tmp/simple-policy.yaml <<EOF
apiVersion: kuma.io/v1alpha1
kind: MeshTrafficPermission
metadata:
  name: test-policy
  mesh: default
spec:
  targetRef:
    kind: Mesh
  from:
  - targetRef:
      kind: Mesh
EOF

kumactl apply -f /tmp/simple-policy.yaml
```

### Option 3: Connect Real Data Planes

To see data plane counts, you need actual services running:

```bash
# This requires running kuma-dp with a service
kuma-dp run \
  --cp-address=http://localhost:5679 \
  --dataplane-token=<get-from-cp> \
  --dataplane-file=<dataplane-config.yaml>
```

## Current Status Summary

✅ **Working:**
- Mesh is running
- Default policies exist
- Control planes are healthy

❌ **Not Showing (Expected):**
- Custom policies (need to be created)
- Data planes (need running services)
- Active zones (zone CP needs proper connection)

## Next Steps

1. **Use GUI**: http://localhost:5681 - Create policies there
2. **Check logs**: `docker-compose logs kuma-global-cp` for admin token
3. **Verify**: After creating via GUI, run `kumactl inspect meshes` again

The mesh is fully functional - it just needs resources added via the GUI!

