# Quick Fix: Understanding Zero Values

## The Issue

When you run `kumactl inspect meshes`, all values show as `0`:
```
MESH      DATAPLANES   TRAFFIC PERMISSIONS   ...
default   0/0          0                     ...
```

## This is NOT a Problem!

**This is completely normal and expected** for a fresh Kuma installation. The mesh is working correctly, but it's empty because:

1. ✅ **Mesh exists** - The `default` mesh is created and running
2. ❌ **No data planes** - No services are connected to the mesh yet
3. ❌ **No custom policies** - Only default system policies exist

## Why Values are Zero

| Column | Why Zero | How to Get Non-Zero |
|--------|----------|---------------------|
| DATAPLANES | No services running with Kuma sidecar | Deploy services or connect data planes |
| TRAFFIC PERMISSIONS | Only default policies exist | Apply custom MeshTrafficPermission policies |
| TRAFFIC ROUTES | No routing policies | Apply MeshHTTPRoute or MeshTCPRoute |
| CIRCUIT BREAKERS | No circuit breaker policies | Apply MeshCircuitBreaker policies |
| HEALTH CHECKS | No health check policies | Apply MeshHealthCheck policies |

## Verification: Mesh is Working

Check that the mesh exists and is functional:

```bash
cd kuma-demo
export PATH=$PATH:$(pwd)/kuma-2.12.4/bin

# 1. Verify mesh exists
kumactl get meshes
# Should show: default mesh

# 2. Check default policies
kumactl get meshtimeouts
# Should show default timeout policies

# 3. Check mesh configuration
kumactl get mesh default
# Should show mesh YAML configuration
```

## To See Non-Zero Values

### Option 1: Apply Policies (Easiest)

You can apply policies using the GUI at http://localhost:5681 or via API, but the simplest way is to understand that **zero values are normal** for a demo setup without running services.

### Option 2: Connect a Data Plane

To see data planes, you would need to:
1. Run an actual application
2. Connect it to Kuma using `kuma-dp`
3. The data plane will register and show up in the counts

### Option 3: Use Kubernetes Mode

If you deploy to Kubernetes and apply the example files:
```bash
kubectl apply -f examples/simple-mesh-setup.yaml
```
This would create services with Kuma sidecars, and you'd see data planes register.

## Conclusion

**The mesh is working correctly.** Zero values indicate an empty mesh, which is the expected state for:
- A fresh installation
- A demo environment without running services
- Universal mode without connected data planes

This is **not a bug or problem** - it's the normal state of a new mesh waiting for services and policies to be added.

## Next Steps

1. ✅ **Mesh is ready** - You can start using it
2. 📖 **Read documentation** - See README.md for pattern examples
3. 🚀 **Deploy services** - When ready, connect services to see data planes
4. 📊 **Use GUI** - Visit http://localhost:5681 for visual interface

