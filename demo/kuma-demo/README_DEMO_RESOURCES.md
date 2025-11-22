# Adding Demo Resources to See Values

## Current Situation

The mesh inspection shows all zeros because:
1. **No data planes are connected** - Data planes must register themselves when `kuma-dp` connects
2. **No zones are active** - Zones register when Zone Control Planes connect to Global CP
3. **Only default policies exist** - Custom policies need to be created

## Important Notes

### Data Planes
In Universal mode, **data planes cannot be created via API**. They must:
1. Run `kuma-dp` process alongside your application
2. Connect to the control plane
3. Register themselves automatically

The data plane resources we created are just **definitions** - they won't show as "connected" until actual `kuma-dp` processes connect.

### Zones  
Zones register automatically when:
1. A Zone Control Plane connects to the Global CP
2. The zone CP authenticates and establishes connection

We already have a zone CP running (`kuma-zone-cp`), but it needs to properly connect to show up.

### Policies
Policies can be created, but the API format in Kong Mesh may differ. The best way is:

## Recommended Approach: Use the GUI

The easiest way to add resources and see values is through the Kuma GUI:

1. **Open the GUI**: http://localhost:5681
2. **Login**: Use default credentials (check logs for admin token)
3. **Create Resources**: Use the GUI to create policies, which will show up in inspections

## Alternative: Check What's Actually There

Even with zeros, you can see what exists:

```bash
cd kuma-demo
export PATH=$PATH:$(pwd)/kuma-2.12.4/bin

# See all timeout policies (including defaults)
kumactl get meshtimeouts

# See all retry policies
kumactl get meshretries

# See all circuit breaker policies  
kumactl get meshcircuitbreakers

# See mesh configuration
kumactl get mesh default -o yaml
```

## To See Non-Zero Values

### For Data Planes:
You need to actually run services with `kuma-dp`:

```bash
# Example: Run a service with kuma-dp
kuma-dp run \
  --cp-address=http://localhost:5679 \
  --dataplane-token=<token> \
  --dataplane-file=<dataplane.yaml>
```

### For Zones:
The zone CP needs to properly connect. Check logs:
```bash
docker-compose logs kuma-zone-cp
```

### For Policies:
Use the GUI at http://localhost:5681 to create policies interactively.

## Summary

The zeros are expected because:
- ✅ Mesh exists and is working
- ✅ Default policies exist (timeout, retry, circuit breaker)
- ❌ No active data planes (need running services)
- ❌ No active zones (zone CP may not be fully connected)
- ❌ No custom policies (can be added via GUI)

**The mesh is functional** - zeros just mean it's waiting for services and policies to be added!

