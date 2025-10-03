#!/bin/bash
# ESXi API Test Script
# Generated automatically

ESXI_HOST="https://192.168.159.128"
ESXI_USER="root"
ESXI_PASS="25836926Hy@"

echo "🚀 Testing ESXi API with curl..."
echo "Host: $ESXI_HOST"
echo "User: $ESXI_USER"
echo ""

# Test 1: Get VMs
echo "1️⃣ Testing Get VMs..."
curl -k -u $ESXI_USER:$ESXI_PASS $ESXI_HOST/api/vms
echo ""

# Test 2: Get Host Info
echo "2️⃣ Testing Get Host Info..."
curl -k -u $ESXI_USER:$ESXI_PASS $ESXI_HOST/api/host
echo ""

# Test 3: Get Storage
echo "3️⃣ Testing Get Storage..."
curl -k -u $ESXI_USER:$ESXI_PASS $ESXI_HOST/api/storage
echo ""

# Test 4: Get Networking
echo "4️⃣ Testing Get Networking..."
curl -k -u $ESXI_USER:$ESXI_PASS $ESXI_HOST/api/networking
echo ""

# Test 5: Get Services
echo "5️⃣ Testing Get Services..."
curl -k -u $ESXI_USER:$ESXI_PASS $ESXI_HOST/api/services
echo ""

echo "🎉 All tests completed!"
