# Kuma Demo Quick Start Guide

This guide walks you through setting up and testing each of the four Kuma patterns demonstrated in this project.

## Prerequisites

1. **Kubernetes Cluster**: Access to a Kubernetes cluster (v1.24+)
   - Local: Minikube, Kind, or Docker Desktop Kubernetes
   - Cloud: EKS, GKE, AKS, or any managed Kubernetes service

2. **kubectl**: Configured to access your cluster
   ```bash
   kubectl cluster-info
   ```

3. **kumactl**: Kuma CLI tool installed
   ```bash
   # Install kumactl
   curl -L https://kuma.io/installer.sh | sh
   export PATH=$PATH:$HOME/.kumactl/bin
   
   # Verify installation
   kumactl version
   ```

## Setup Steps

### Step 1: Install Kuma Control Plane

#### Option A: Kubernetes Mode (Recommended for Demo)

```bash
# Install Global Control Plane
kumactl install control-plane \
  --mode=global \
  --namespace=kuma-system | kubectl apply -f -

# Wait for control plane to be ready
kubectl wait --namespace kuma-system \
  --for=condition=ready pod \
  --selector=app=kuma-control-plane \
  --timeout=90s

# Verify installation
kubectl get pods -n kuma-system
```

#### Option B: Universal Mode (For VM/Bare Metal)

```bash
# Download and run Global CP
KUMA_VERSION=2.6.0
wget https://github.com/kumahq/kuma/releases/download/${KUMA_VERSION}/kuma-${KUMA_VERSION}-linux-amd64.tar.gz
tar -xzf kuma-${KUMA_VERSION}-linux-amd64.tar.gz
cd kuma-${KUMA_VERSION}/bin

# Start Global CP
./kuma-cp run --mode=global
```

### Step 2: Access Kuma GUI

```bash
# Port forward to Kuma GUI
kubectl port-forward -n kuma-system svc/kuma-gui 5681:5681

# Open browser to http://localhost:5681
# Default credentials: admin / admin
```

### Step 3: Apply Pattern Configurations

#### Pattern 1: Global/Zone Control Plane Separation

```bash
# Apply Global CP configuration
kubectl apply -f patterns/pattern1-global-zone-cp/global-cp-config.yaml

# Apply Zone CP configuration (for each zone)
kubectl apply -f patterns/pattern1-global-zone-cp/zone-cp-config.yaml

# Register zone with Global CP
kubectl apply -f patterns/pattern1-global-zone-cp/zone-resource.yaml

# Verify zone registration
kumactl inspect zones
```

#### Pattern 2: Multi-Zone Service Discovery

```bash
# Enable mTLS on mesh (required for cross-zone communication)
kubectl apply -f patterns/pattern2-multi-zone-discovery/mesh-mtls.yaml

# Deploy Zone Ingress in each zone
kubectl apply -f patterns/pattern2-multi-zone-discovery/zone-ingress.yaml

# Verify Zone Ingress
kubectl get zoneingresses -n kuma-system

# Apply service discovery example
kubectl apply -f patterns/pattern2-multi-zone-discovery/service-discovery-example.yaml
```

#### Pattern 3: Delegated Gateway Pattern

```bash
# Configure Kong as delegated gateway
kubectl apply -f patterns/pattern3-delegated-gateway/kong-gateway-dataplane.yaml

# Apply mesh gateway policies
kubectl apply -f patterns/pattern3-delegated-gateway/mesh-gateway-policy.yaml

# Configure internal service policies
kubectl apply -f patterns/pattern3-delegated-gateway/internal-service-policy.yaml

# Verify gateway configuration
kubectl get dataplanes -n kuma-system
```

#### Pattern 4: Policy Priority Hierarchy

```bash
# Deploy platform default timeout policy
kubectl apply -f patterns/pattern4-policy-priority/platform-default-timeout.yaml

# Deploy application-specific override
kubectl apply -f patterns/pattern4-policy-priority/application-override-timeout.yaml

# Deploy zone-level override
kubectl apply -f patterns/pattern4-policy-priority/zone-override-policy.yaml

# Verify policy hierarchy
kumactl inspect policies
```

## Testing Each Pattern

### Test Pattern 1: Global/Zone CP Separation

1. **Verify Global CP is running**:
   ```bash
   kubectl get pods -n kuma-system -l app=kuma-control-plane
   ```

2. **Verify Zone CP connection**:
   ```bash
   kumactl inspect zones
   # Should show registered zones
   ```

3. **Test policy propagation**:
   ```bash
   # Create a policy on Global CP
   kubectl apply -f examples/simple-mesh-setup.yaml
   
   # Verify policy appears in Zone CP
   kumactl inspect policies
   ```

### Test Pattern 2: Multi-Zone Service Discovery

1. **Verify mTLS is enabled**:
   ```bash
   kubectl get mesh default -o yaml | grep mtls
   ```

2. **Verify Zone Ingress**:
   ```bash
   kubectl get zoneingresses -n kuma-system
   ```

3. **Test cross-zone service discovery**:
   ```bash
   # Deploy a test service in zone 1
   kubectl apply -f examples/multi-zone-example.yaml
   
   # Query service from zone 2
   # Service should resolve to Zone Ingress address
   ```

### Test Pattern 3: Delegated Gateway Pattern

1. **Verify Kong gateway**:
   ```bash
   kubectl get dataplanes -n kuma-system | grep kong
   ```

2. **Test external traffic**:
   ```bash
   # External requests should route through Kong
   curl -H "Host: api.example.com" http://kong-gateway:8000/api/service
   ```

3. **Test internal traffic**:
   ```bash
   # Internal service-to-service traffic uses Kuma mesh
   kubectl exec -it <service-pod> -- curl http://other-service:8080
   ```

### Test Pattern 4: Policy Priority Hierarchy

1. **Verify platform default**:
   ```bash
   kubectl get meshtimeout platform-default-timeouts -o yaml
   # Should have kuma.io/policy-role: system
   ```

2. **Verify application override**:
   ```bash
   kubectl get meshtimeout app-specific-timeout -o yaml
   # Should have kuma.io/policy-role: workload-owner
   # Should target specific Dataplane
   ```

3. **Test policy precedence**:
   ```bash
   # Application-specific policy should override platform default
   kumactl inspect dataplane <dataplane-name> --type=timeout
   ```

## Troubleshooting

### Control Plane Not Starting

```bash
# Check control plane logs
kubectl logs -n kuma-system -l app=kuma-control-plane

# Check control plane status
kubectl get pods -n kuma-system
```

### Zone Not Connecting to Global CP

```bash
# Verify zone configuration
kubectl get zone <zone-name> -o yaml

# Check zone CP logs
kubectl logs -n kuma-system -l app=kuma-zone-control-plane

# Verify network connectivity
kubectl exec -it <zone-cp-pod> -n kuma-system -- ping <global-cp-address>
```

### mTLS Not Working

```bash
# Verify mTLS is enabled
kubectl get mesh default -o yaml | grep -A 10 mtls

# Check MeshTrafficPermission
kubectl get meshtrafficpermission

# Verify certificates
kumactl inspect certificates
```

### Policy Not Applying

```bash
# Check policy status
kumactl inspect policies

# Verify targetRef
kubectl get <policy-type> <policy-name> -o yaml | grep targetRef

# Check XDS delivery
kumactl inspect dataplane <dataplane-name> --type=timeout
```

## Cleanup

### Remove All Patterns

```bash
# Remove Pattern 4
kubectl delete -f patterns/pattern4-policy-priority/

# Remove Pattern 3
kubectl delete -f patterns/pattern3-delegated-gateway/

# Remove Pattern 2
kubectl delete -f patterns/pattern2-multi-zone-discovery/

# Remove Pattern 1
kubectl delete -f patterns/pattern1-global-zone-cp/
```

### Uninstall Kuma Control Plane

```bash
# Kubernetes mode
kumactl install control-plane --mode=global | kubectl delete -f -

# Or manually
kubectl delete namespace kuma-system
```

## Next Steps

1. **Explore Kuma GUI**: Access http://localhost:5681 to visualize your mesh
2. **Review Policies**: Use `kumactl inspect` commands to explore policies
3. **Monitor Metrics**: Set up Prometheus/Grafana for observability
4. **Read Documentation**: See [README.md](./README.md) for detailed pattern explanations

## Additional Resources

- [Kuma Documentation](https://kuma.io/docs)
- [Kong Mesh Documentation](https://docs.konghq.com/mesh/)
- [Kuma Production Skill Document](../agent-framework/agents/agent-skills/skills-hms/implementing-kuma-production/SKILL.md)

