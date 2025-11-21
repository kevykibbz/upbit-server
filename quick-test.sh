#!/bin/bash

# Quick test runner for Upbit detector
echo "🚀 UPBIT DETECTOR QUICK TEST"
echo "============================"

# Check if test server is running
echo "Checking test server..."
if curl -s http://localhost:8000/health | grep -q "healthy"; then
    echo "✅ Test server is running"
else
    echo "❌ Test server not running. Starting..."
    echo "Please run: cd C:/Users/user/techzone/upbit-server && node test-server.js"
    exit 1
fi

# Set up a new listing test
echo ""
echo "Setting up NEW LISTING test scenario..."
curl -s -X POST http://localhost:8000/test/scenario/new-listing-now
echo ""

# Display current time
echo "Current KST time:"
curl -s http://localhost:8000/health | grep kst_time

echo ""
echo "🎯 NOW START YOUR DETECTOR:"
echo "cd c:/Users/user/techzone/upbit-cpp"
echo "./ultra_fast_detector.exe --test"
echo ""
echo "Expected: You should see a 'TARGET CRUSHED' alert within 1-2 minutes!"
echo ""
echo "Press Ctrl+C to stop this script when done testing."

# Keep checking scenario status
while true; do
    sleep 30
    echo ""
    echo "📊 Current test status:"
    curl -s http://localhost:8000/test/scenario | grep -E "(current_scenario|kst_time)"
done