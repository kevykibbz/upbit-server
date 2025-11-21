#!/bin/bash

# 🧪 Upbit Detector Comprehensive Test Suite
# Tests all possible scenarios with Korean timezone simulation

echo "🚀 UPBIT DETECTOR COMPREHENSIVE TEST SUITE"
echo "==========================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

TEST_SERVER="http://localhost:8000"
DETECTOR_PATH="c:/Users/user/techzone/upbit-cpp"

# Test counter
TESTS_PASSED=0
TESTS_FAILED=0

print_test_header() {
    echo ""
    echo -e "${BLUE}📋 TEST: $1${NC}"
    echo "----------------------------------------"
}

print_success() {
    echo -e "${GREEN}✅ PASS: $1${NC}"
    ((TESTS_PASSED++))
}

print_failure() {
    echo -e "${RED}❌ FAIL: $1${NC}"
    ((TESTS_FAILED++))
}

print_warning() {
    echo -e "${YELLOW}⚠️  WARN: $1${NC}"
}

# Function to wait and check logs
check_detector_output() {
    local expected_behavior="$1"
    local timeout="$2"
    echo "Waiting ${timeout}s to check detector behavior: $expected_behavior"
    sleep $timeout
}

# Function to set test scenario
set_scenario() {
    local scenario="$1"
    echo "Setting test scenario: $scenario"
    curl -s -X POST "$TEST_SERVER/test/scenario/$scenario" | jq '.description' 2>/dev/null || echo "Scenario set"
    sleep 2
}

# Test 1: Server Health Check
print_test_header "Test Server Health Check"
if curl -s "$TEST_SERVER/health" | grep -q "healthy"; then
    print_success "Test server is running and healthy"
else
    print_failure "Test server is not responding"
    echo "Please start the test server: node test-server.js"
    exit 1
fi

# Test 2: API Response Format
print_test_header "API Response Format Validation"
API_RESPONSE=$(curl -s "$TEST_SERVER/api/v1/announcements?os=web&page=1&per_page=3&category=trade")
if echo "$API_RESPONSE" | jq '.success' | grep -q "true"; then
    print_success "API returns valid JSON format"
else
    print_failure "API response format is invalid"
fi

# Test 3: No New Listings (Baseline)
print_test_header "Baseline - No New Listings"
set_scenario "no-new-listings"
echo "Expected: All announcements should be filtered as OLD"
echo "Manual check: Run detector and verify no alerts"

# Test 4: Old Listing Filter
print_test_header "Date Filter - Old Announcements"
set_scenario "old-listing"
echo "Expected: Announcement from 1 hour ago should be filtered as OLD"
echo "Manual check: Run detector and verify no alerts for old listing"

# Test 5: Future Listing Detection
print_test_header "Future Listing - 1 Minute Ahead"
set_scenario "new-listing-now"
echo "Expected: NEW listing alert should trigger"
echo "Expected behavior: TARGET CRUSHED alert with sub-500ms detection"
echo ""
echo "🎯 MANUAL TEST STEP:"
echo "1. Start detector: ./ultra_fast_detector.exe --test"
echo "2. Watch for NEW LISTING DETECTED alert"
echo "3. Verify detection speed calculation"

# Test 6: Business Hours Priority
print_test_header "Business Hours Priority Detection"
set_scenario "business-hours"  
echo "Expected: NEW listing with HIGH priority (Korean business hours)"
echo "Expected: Priority marking in logs"

# Test 7: Custom Announcement Test
print_test_header "Custom Announcement Creation"
CUSTOM_RESULT=$(curl -s -X POST "$TEST_SERVER/test/announcement" \
    -H "Content-Type: application/json" \
    -d '{
        "title": "🧪 MANUAL TEST: CustomCoin(CUSTOM) 신규 상장 테스트",
        "category": "Trade", 
        "offset_minutes": 2
    }')

if echo "$CUSTOM_RESULT" | jq '.success' | grep -q "true"; then
    print_success "Custom announcement created successfully"
    CUSTOM_ID=$(echo "$CUSTOM_RESULT" | jq '.announcement.id')
    echo "Custom announcement ID: $CUSTOM_ID"
else
    print_failure "Failed to create custom announcement"
fi

# Test 8: Multiple Scenarios Test
print_test_header "Scenario Switching Test"
scenarios=("no-new-listings" "new-listing-5min" "business-hours" "old-listing")

for scenario in "${scenarios[@]}"; do
    echo "Testing scenario: $scenario"
    if curl -s -X POST "$TEST_SERVER/test/scenario/$scenario" | grep -q "success"; then
        print_success "Scenario '$scenario' activated successfully"
    else
        print_failure "Failed to activate scenario '$scenario'"
    fi
    sleep 1
done

# Test 9: Timezone Verification
print_test_header "Korean Timezone (KST) Verification"
KST_TIME=$(curl -s "$TEST_SERVER/health" | jq -r '.kst_time')
if [[ "$KST_TIME" == *"+09:00" ]]; then
    print_success "Server is correctly using Korean timezone (KST)"
    echo "Current KST time: $KST_TIME"
else
    print_failure "Server timezone is incorrect"
    echo "Expected: +09:00, Got: $KST_TIME"
fi

# Test 10: Performance Baseline
print_test_header "Performance Baseline Test"
echo "Testing API response time..."
START_TIME=$(date +%s%N)
curl -s "$TEST_SERVER/api/v1/announcements" > /dev/null
END_TIME=$(date +%s%N)
RESPONSE_TIME=$(((END_TIME - START_TIME) / 1000000)) # Convert to milliseconds

if [ "$RESPONSE_TIME" -lt 100 ]; then
    print_success "API response time: ${RESPONSE_TIME}ms (Excellent)"
elif [ "$RESPONSE_TIME" -lt 500 ]; then
    print_success "API response time: ${RESPONSE_TIME}ms (Good)"
else
    print_warning "API response time: ${RESPONSE_TIME}ms (May affect detection speed)"
fi

# Test Summary
echo ""
echo "🏁 TEST SUITE SUMMARY"
echo "===================="
echo -e "Tests Passed: ${GREEN}$TESTS_PASSED${NC}"
echo -e "Tests Failed: ${RED}$TESTS_FAILED${NC}"
echo "Total Tests: $((TESTS_PASSED + TESTS_FAILED))"

if [ "$TESTS_FAILED" -eq 0 ]; then
    echo -e "\n${GREEN}🎉 ALL TESTS PASSED! Test server is ready for detector testing.${NC}"
else
    echo -e "\n${RED}⚠️  Some tests failed. Please review the failures above.${NC}"
fi

echo ""
echo "🎮 MANUAL TESTING INSTRUCTIONS:"
echo "================================"
echo "1. Start the test server:"
echo "   cd C:/Users/user/techzone/upbit-server"
echo "   node test-server.js"
echo ""
echo "2. In another terminal, start the detector:"
echo "   cd C:/Users/user/techzone/upbit-cpp" 
echo "   ./ultra_fast_detector.exe --test"
echo ""
echo "3. Test scenarios using curl commands:"
echo "   # Set new listing scenario"
echo "   curl -X POST http://localhost:8000/test/scenario/new-listing-now"
echo ""
echo "   # Create custom announcement"
echo "   curl -X POST http://localhost:8000/test/announcement \\"
echo "     -H \"Content-Type: application/json\" \\"
echo "     -d '{\"title\": \"Test Coin(TEST) New Listing\", \"offset_minutes\": 1}'"
echo ""
echo "   # Check current scenario"
echo "   curl http://localhost:8000/test/scenario"
echo ""
echo "4. Expected behaviors to verify:"
echo "   ✅ Old announcements filtered out (no alerts)"
echo "   ✅ New announcements trigger TARGET CRUSHED alerts"  
echo "   ✅ Detection speeds under 500ms"
echo "   ✅ Korean timezone timestamps in logs"
echo "   ✅ Business hours priority detection"
echo ""
echo "🔧 Cleanup after testing:"
echo "   curl -X DELETE http://localhost:8000/test/announcements  # Clear custom announcements"
echo "   curl -X POST http://localhost:8000/test/scenario/no-new-listings  # Reset to baseline"