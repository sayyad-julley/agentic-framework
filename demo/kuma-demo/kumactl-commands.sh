#!/bin/bash
# Kuma CLI Commands for Demo
# This script sets up kumactl and provides common commands

# Add kumactl to PATH (using version 2.12.4 to match control plane)
export PATH=$PATH:$(cd "$(dirname "$0")" && pwd)/kuma-2.12.4/bin

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${GREEN}Kuma CLI Commands${NC}"
echo "=================="
echo ""

# Check if kumactl is available
if ! command -v kumactl &> /dev/null; then
    echo "Error: kumactl not found. Please run the installer first."
    exit 1
fi

# Configure control plane if not already configured
echo -e "${BLUE}Configuring control plane...${NC}"
kumactl config control-planes add --name=local-global --address=http://localhost:5681 --overwrite 2>/dev/null

echo ""
echo -e "${GREEN}Available Commands:${NC}"
echo ""
echo "1. Inspect Meshes:"
echo "   kumactl inspect meshes"
echo ""
echo "2. Inspect Zones:"
echo "   kumactl inspect zones"
echo ""
echo "3. Inspect Data Planes:"
echo "   kumactl inspect dataplanes"
echo ""
echo "4. Inspect Policies:"
echo "   kumactl inspect policies"
echo ""
echo "5. Get Meshes:"
echo "   kumactl get meshes"
echo ""
echo "6. Get Policies:"
echo "   kumactl get meshtimeouts"
echo "   kumactl get meshretries"
echo "   kumactl get meshtrafficpermissions"
echo ""
echo "7. Apply Pattern Configurations:"
echo "   kubectl apply -f patterns/pattern1-global-zone-cp/"
echo "   kubectl apply -f patterns/pattern2-multi-zone-discovery/"
echo "   kubectl apply -f patterns/pattern3-delegated-gateway/"
echo "   kubectl apply -f patterns/pattern4-policy-priority/"
echo ""
echo "8. View Control Plane Status:"
echo "   kumactl config control-planes list"
echo ""
echo "9. Switch Control Plane:"
echo "   kumactl config control-planes switch local-global"
echo ""
echo -e "${BLUE}Running quick inspection...${NC}"
echo ""

# Run inspections
echo "=== Meshes ==="
kumactl inspect meshes
echo ""

echo "=== Zones ==="
kumactl inspect zones
echo ""

echo "=== Data Planes ==="
kumactl inspect dataplanes
echo ""

echo "=== Policies ==="
kumactl inspect policies
echo ""

echo -e "${GREEN}Done!${NC}"
echo ""
echo "Access GUI at: http://localhost:5681"

