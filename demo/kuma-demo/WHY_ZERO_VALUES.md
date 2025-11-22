# Why All Values Show as '0' in Mesh Inspection

## Explanation

When you run `kumactl inspect meshes`, you see all values as `0` because:

1. **No Data Planes Connected**: The mesh exists but no services/data planes have registered with it
2. **No Policies Applied**: While some default policies exist, no custom policies have been successfully applied
3. **Universal Mode**: We're running in Universal mode (not Kubernetes), so Kubernetes resources can't be applied

## Current Status

The mesh inspection shows:
```
MESH      DATAPLANES   TRAFFIC PERMISSIONS   TRAFFIC ROUTES   ...
default   0/0          0                     0                ...
```

This means:
- **DATAPLANES: 0/0** - No data planes are connected to the mesh
- **TRAFFIC PERMISSIONS: 0** - No traffic permission policies (besides defaults)
- **TRAFFIC ROUTES: 0** - No traffic routing policies
- And so on for other policy types

## How to Get Non-Zero Values

### Option 1: Apply Policies (Shows Policy Counts)

```bash
cd kuma-demo
export PATH=$PATH:$(pwd)/kuma-2.12.4/bin

# Apply a traffic permission policy
cat <<'EOF' | kumactl apply -f -
apiVersion: kuma.io/v1alpha1
kind: MeshTrafficPermission
metadata:
  name: allow-all
  mesh: default
spec:
  targetRef:
    kind: Mesh
  from:
  - targetRef:
      kind: Mesh
EOF

# Apply a timeout policy
cat <<'EOF' | kumactl apply -f -
apiVersion: kuma.io/v1alpha1
kind: MeshTimeout
metadata:
  name: demo-timeout
  mesh: default
spec:
  targetRef:
    kind: Mesh
  to:
  - targetRef:
      kind: Mesh
    default:
      connectionTimeout: 5s
EOF

# Now check - you should see policy counts
kumactl inspect meshes
```

### Option 2: Connect a Data Plane (Shows Data Plane Counts)

To see data planes, you need to actually run a service with Kuma sidecar:

```bash
# This requires running kuma-dp alongside an application
# Example (if you have an app running):
kuma-dp run \
  --cp-address=http://localhost:5679 \
  --dataplane-token-file=/path/to/token \
  --dataplane-file=/path/to/dataplane.yaml
```

### Option 3: Use Kubernetes Mode

If you switch to Kubernetes mode, you can apply the full example files:

```bash
# Apply Kubernetes resources
kubectl apply -f examples/simple-mesh-setup.yaml

# This will create services and deployments with Kuma sidecars
# Data planes will automatically register
```

## Understanding the Output

The `kumactl inspect meshes` command shows:

- **DATAPLANES: X/Y** - X = connected data planes, Y = total expected
- **TRAFFIC PERMISSIONS: N** - Number of traffic permission policies
- **TRAFFIC ROUTES: N** - Number of traffic routing policies
- **CIRCUIT BREAKERS: N** - Number of circuit breaker policies
- And so on...

## Why This is Normal

**This is expected behavior** for a fresh Kuma installation:
- The mesh is created but empty
- No services are running with Kuma sidecars
- No custom policies have been applied yet

The mesh is ready to use, but you need to either:
1. Apply policies to see policy counts increase
2. Connect data planes to see data plane counts increase
3. Deploy services (in Kubernetes) to automatically get data planes

## Quick Test

To verify the mesh is working, check what policies exist:

```bash
# List all policies
kumactl get meshtrafficpermissions
kumactl get meshtimeouts
kumactl get meshtls

# Check mesh configuration
kumactl get mesh default -o yaml
```

Even with 0 values, the mesh is functional and ready to use!

