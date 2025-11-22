# Kuma Service Mesh Features Demo

Production-ready Kuma (Kong Mesh) service mesh implementation demonstrating four key architectural patterns for enterprise deployments.

## Overview

This project demonstrates Kuma service mesh features including:

- **Pattern 1: Global/Zone Control Plane Separation** - Centralized policy governance with distributed execution
- **Pattern 2: Multi-Zone Service Discovery** - Cross-zone routing with automatic failover
- **Pattern 3: Delegated Gateway Pattern** - API gateway integration with service mesh
- **Pattern 4: Policy Priority Hierarchy** - Platform defaults with application overrides

## Features Demonstrated

### Pattern 1: Global/Zone Control Plane Separation

**Architecture**: Global CP serves as central policy configuration hub, accepting connections only from Zone CPs. Zone CPs manage local Data Planes and receive policy updates from Global CP. Network isolation prevents Data Planes from connecting directly to Global CP.

**Key Features**:
- Centralized policy configuration at Global CP
- Distributed execution at Zone CP level
- Network isolation for stability and scalability
- Policy propagation from Global to Zone CPs

**When to Use**: Multi-zone deployments, multi-cluster environments, organizations requiring centralized governance.

**Configuration Files**:
- `patterns/pattern1-global-zone-cp/global-cp-config.yaml` - Global Control Plane configuration
- `patterns/pattern1-global-zone-cp/zone-cp-config.yaml` - Zone Control Plane configuration
- `patterns/pattern1-global-zone-cp/zone-resource.yaml` - Zone resource definition

### Pattern 2: Multi-Zone Service Discovery

**Architecture**: Zone Ingress proxies handle cross-zone traffic routing. Built-in DNS server resolves services to local replicas or remote Zone Ingress addresses, enabling automatic failover. mTLS is mandatory for cross-zone communication to establish identity context.

**Key Features**:
- Cross-zone service routing via Zone Ingress
- Automatic service discovery with DNS resolution
- Built-in failover capabilities
- mTLS for secure cross-zone communication

**When to Use**: Multi-region deployments, disaster recovery requirements, geographical service distribution.

**Configuration Files**:
- `patterns/pattern2-multi-zone-discovery/mesh-mtls.yaml` - Mesh with mTLS enabled
- `patterns/pattern2-multi-zone-discovery/zone-ingress.yaml` - Zone Ingress configuration
- `patterns/pattern2-multi-zone-discovery/service-discovery-example.yaml` - Service discovery example

### Pattern 3: Delegated Gateway Pattern

**Architecture**: External API gateway (Kong) handles perimeter security (rate limiting, authentication, request timeouts). Kuma manages internal service-to-service traffic, applying L4/L7 policies. Clear separation of concerns: gateway for external, mesh for internal.

**Key Features**:
- Kong API Gateway for perimeter security
- Kuma service mesh for internal traffic
- Clear separation of external vs internal governance
- Unified policy management

**When to Use**: Integrating Kong or other API gateways with service mesh, separating perimeter and internal governance.

**Configuration Files**:
- `patterns/pattern3-delegated-gateway/kong-gateway-dataplane.yaml` - Kong gateway as delegated gateway
- `patterns/pattern3-delegated-gateway/mesh-gateway-policy.yaml` - Mesh gateway policy
- `patterns/pattern3-delegated-gateway/internal-service-policy.yaml` - Internal service mesh policy

### Pattern 4: Policy Priority Hierarchy

**Architecture**: Policies are prioritized by: targetRef specificity (most specific wins), origin label (zone overrides global), policy-role label (workload-owner overrides system). This enables platform defaults with application-specific overrides while maintaining governance.

**Key Features**:
- Platform-wide defaults with `kuma.io/policy-role: system`
- Application-specific overrides with `kuma.io/policy-role: workload-owner`
- Priority based on targetRef specificity
- Zone-level overrides via origin labels

**When to Use**: Large organizations with platform teams and application teams, need for consistent defaults with flexibility for exceptions.

**Configuration Files**:
- `patterns/pattern4-policy-priority/platform-default-timeout.yaml` - Platform default timeout policy
- `patterns/pattern4-policy-priority/application-override-timeout.yaml` - Application-specific timeout override
- `patterns/pattern4-policy-priority/zone-override-policy.yaml` - Zone-level policy override

## Project Structure

```
kuma-demo/
├── README.md                                    # This file
├── QUICKSTART.md                                # Quick start guide
├── docker-compose.yml                           # Local testing environment
├── patterns/
│   ├── pattern1-global-zone-cp/                # Pattern 1: Global/Zone CP Separation
│   │   ├── global-cp-config.yaml
│   │   ├── zone-cp-config.yaml
│   │   └── zone-resource.yaml
│   ├── pattern2-multi-zone-discovery/           # Pattern 2: Multi-Zone Service Discovery
│   │   ├── mesh-mtls.yaml
│   │   ├── zone-ingress.yaml
│   │   └── service-discovery-example.yaml
│   ├── pattern3-delegated-gateway/             # Pattern 3: Delegated Gateway Pattern
│   │   ├── kong-gateway-dataplane.yaml
│   │   ├── mesh-gateway-policy.yaml
│   │   └── internal-service-policy.yaml
│   └── pattern4-policy-priority/               # Pattern 4: Policy Priority Hierarchy
│       ├── platform-default-timeout.yaml
│       ├── application-override-timeout.yaml
│       └── zone-override-policy.yaml
└── examples/
    ├── simple-mesh-setup.yaml                   # Simple single-zone mesh setup
    ├── multi-zone-example.yaml                  # Multi-zone deployment example
    └── policy-examples.yaml                     # Policy examples
```

## Prerequisites

- Kubernetes cluster (v1.24+) or VM/bare metal environment
- `kubectl` configured to access your cluster
- `kumactl` CLI tool installed ([Installation Guide](https://kuma.io/docs/2.6.x/installation/))
- PostgreSQL (for Universal/Hybrid mode persistent storage)
- Network connectivity between control plane and data planes

## Quick Start

See [QUICKSTART.md](./QUICKSTART.md) for detailed setup instructions.

### 1. Install Kuma Control Plane

```bash
# Install Global Control Plane
kumactl install control-plane | kubectl apply -f -

# Or for Universal mode
kumactl install control-plane --mode=universal
```

### 2. Apply Pattern Configurations

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

## Pattern Details

### Pattern 1: Global/Zone Control Plane Separation

**Architecture Overview**:
- **Global CP**: Policy configuration hub, accepts connections only from Zone CPs
- **Zone CP**: Execution layer managing local Data Planes, receives policy updates from Global CP
- **Network Isolation**: Data Planes cannot connect directly to Global CP

**Benefits**:
- Centralized governance with distributed execution
- Improved scalability (no direct DP connections to Global CP)
- Better stability (reduced connection storms)
- Policy consistency across zones

**Configuration**:
- Global CP configured to reject direct Data Plane connections
- Zone CP configured to connect to Global CP for policy updates
- Zone resource defines zone topology

### Pattern 2: Multi-Zone Service Discovery

**Architecture Overview**:
- **Zone Ingress**: Handles inbound traffic from remote zones
- **DNS Resolution**: Built-in DNS server resolves services to local or remote addresses
- **mTLS**: Mandatory for cross-zone communication to establish identity

**Benefits**:
- Automatic cross-zone routing
- Built-in failover capabilities
- Secure communication with mTLS
- Geographic service distribution

**Configuration**:
- Mesh with mTLS enabled
- Zone Ingress proxies configured per zone
- Service discovery via built-in DNS

### Pattern 3: Delegated Gateway Pattern

**Architecture Overview**:
- **Kong Gateway**: Handles perimeter security (rate limiting, authentication, timeouts)
- **Kuma Mesh**: Manages internal service-to-service traffic with L4/L7 policies
- **Separation**: Gateway for external, mesh for internal

**Benefits**:
- Clear separation of concerns
- Unified policy management
- API gateway integration
- Perimeter and internal governance separation

**Configuration**:
- Kong gateway configured as delegated gateway
- Mesh gateway policies for external traffic
- Internal service policies for mesh traffic

### Pattern 4: Policy Priority Hierarchy

**Architecture Overview**:
- **Priority Determinants**:
  1. `spec.targetRef` specificity: Dataplane by name > MeshService > Mesh
  2. `kuma.io/origin` label: zone > global
  3. `kuma.io/policy-role` label: workload-owner > consumer > producer > system

**Benefits**:
- Platform defaults with application flexibility
- Consistent governance with exception handling
- Clear policy precedence rules
- Multi-team collaboration support

**Configuration**:
- Platform defaults with `kuma.io/policy-role: system` and `kind: Mesh` target
- Application overrides with specific targets and `kuma.io/policy-role: workload-owner`
- Zone overrides via `kuma.io/origin: zone` label

## Usage Examples

### Example 1: Deploy Global/Zone CP Setup

```bash
# 1. Deploy Global CP
kubectl apply -f patterns/pattern1-global-zone-cp/global-cp-config.yaml

# 2. Deploy Zone CP in each zone
kubectl apply -f patterns/pattern1-global-zone-cp/zone-cp-config.yaml

# 3. Register zones with Global CP
kubectl apply -f patterns/pattern1-global-zone-cp/zone-resource.yaml
```

### Example 2: Enable Multi-Zone Service Discovery

```bash
# 1. Enable mTLS on mesh
kubectl apply -f patterns/pattern2-multi-zone-discovery/mesh-mtls.yaml

# 2. Deploy Zone Ingress in each zone
kubectl apply -f patterns/pattern2-multi-zone-discovery/zone-ingress.yaml

# 3. Services automatically discover cross-zone endpoints
kubectl apply -f patterns/pattern2-multi-zone-discovery/service-discovery-example.yaml
```

### Example 3: Integrate Kong Gateway

```bash
# 1. Configure Kong as delegated gateway
kubectl apply -f patterns/pattern3-delegated-gateway/kong-gateway-dataplane.yaml

# 2. Apply mesh gateway policies
kubectl apply -f patterns/pattern3-delegated-gateway/mesh-gateway-policy.yaml

# 3. Configure internal service policies
kubectl apply -f patterns/pattern3-delegated-gateway/internal-service-policy.yaml
```

### Example 4: Configure Policy Priority

```bash
# 1. Deploy platform defaults
kubectl apply -f patterns/pattern4-policy-priority/platform-default-timeout.yaml

# 2. Application teams can override with specific policies
kubectl apply -f patterns/pattern4-policy-priority/application-override-timeout.yaml

# 3. Zone-level overrides
kubectl apply -f patterns/pattern4-policy-priority/zone-override-policy.yaml
```

## Monitoring and Observability

### Key Metrics

- **Control Plane**: `xds_generation` time, `xds_delivery` time
- **Data Plane**: Envoy proxy metrics, connection counts
- **Policy**: Policy propagation time, policy conflicts

### Accessing Kuma GUI

```bash
# Port forward to Kuma GUI
kubectl port-forward -n kuma-system svc/kuma-gui 5681:5681

# Access at http://localhost:5681
```

## Security Considerations

- **mTLS**: Always enable mTLS for production meshes
- **MeshTrafficPermission**: Use explicit permissions (deny-by-default)
- **CA Rotation**: Configure multiple CA backends for zero-downtime rotation
- **Network Isolation**: Prevent direct DP connections to Global CP

## Related Resources

- [Kuma Documentation](https://kuma.io/docs)
- [Kong Mesh Documentation](https://docs.konghq.com/mesh/)
- [Kuma Production Skill Document](../agent-framework/agents/agent-skills/skills-hms/implementing-kuma-production/SKILL.md)

## Notes

- Kuma supports both Kubernetes and Universal (VM/bare metal) deployments
- Global CP manages policy configuration, Zone CPs handle execution
- mTLS is mandatory for cross-zone communication
- Policy priority enables platform governance with application flexibility
- Zone Ingress enables automatic cross-zone service discovery

