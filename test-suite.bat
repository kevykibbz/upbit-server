@echo off
echo 🧪 UPBIT DETECTOR TEST SUITE - Windows Version
echo ===============================================
echo.

REM Test server configuration
set TEST_SERVER=http://localhost:8000
set DETECTOR_PATH=c:\Users\user\techzone\upbit-cpp

REM Check if curl is available
curl --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ curl is not available. Please install curl or use Git Bash.
    pause
    exit /b 1
)

echo 📋 Test 1: Server Health Check
echo --------------------------------
curl -s %TEST_SERVER%/health | findstr "healthy" >nul
if %errorlevel% equ 0 (
    echo ✅ Test server is healthy
) else (
    echo ❌ Test server not responding. Please start: node test-server.js
    pause
    exit /b 1
)

echo.
echo 📋 Test 2: Setting Test Scenarios
echo ----------------------------------

REM Test scenario switching
echo Setting up old listing test...
curl -s -X POST %TEST_SERVER%/test/scenario/old-listing >nul
timeout /t 2 >nul

echo Setting up new listing test...
curl -s -X POST %TEST_SERVER%/test/scenario/new-listing-now >nul
timeout /t 2 >nul

echo Setting up business hours test...  
curl -s -X POST %TEST_SERVER%/test/scenario/business-hours >nul
timeout /t 2 >nul

echo ✅ All test scenarios configured

echo.
echo 📋 Test 3: Custom Announcement Creation
echo ----------------------------------------
curl -s -X POST %TEST_SERVER%/test/announcement -H "Content-Type: application/json" -d "{\"title\": \"🧪 WINDOWS TEST: TestCoin(WIN) 신규 상장\", \"offset_minutes\": 1}" | findstr "success" >nul
if %errorlevel% equ 0 (
    echo ✅ Custom announcement created successfully
) else (
    echo ❌ Failed to create custom announcement
)

echo.
echo 🎮 MANUAL TESTING PHASE
echo ========================
echo.
echo 1. Keep this window open
echo 2. Open a new Command Prompt or PowerShell
echo 3. Run these commands to test:
echo.
echo    cd %DETECTOR_PATH%
echo    .\ultra_fast_detector.exe --test
echo.
echo 4. In another window, you can control test scenarios:
echo.

:menu
echo.
echo 🎛️  TEST CONTROL MENU
echo =====================
echo 1. Set NO new listings (baseline)
echo 2. Set NEW listing in 1 minute
echo 3. Set NEW listing in 5 minutes  
echo 4. Set OLD listing (should be filtered)
echo 5. Set BUSINESS HOURS priority listing
echo 6. Create CUSTOM announcement
echo 7. Clear all custom announcements
echo 8. Check current scenario
echo 9. Exit test suite
echo.
set /p choice="Enter your choice (1-9): "

if "%choice%"=="1" (
    echo Setting baseline scenario...
    curl -s -X POST %TEST_SERVER%/test/scenario/no-new-listings
    echo ✅ Set to baseline - no new listings
) else if "%choice%"=="2" (
    echo Setting new listing in 1 minute...
    curl -s -X POST %TEST_SERVER%/test/scenario/new-listing-now
    echo ✅ New listing will appear in 1 minute
    echo 👀 Watch your detector for "TARGET CRUSHED" alert!
) else if "%choice%"=="3" (
    echo Setting new listing in 5 minutes...
    curl -s -X POST %TEST_SERVER%/test/scenario/new-listing-5min
    echo ✅ New listing will appear in 5 minutes
) else if "%choice%"=="4" (
    echo Setting old listing test...
    curl -s -X POST %TEST_SERVER%/test/scenario/old-listing
    echo ✅ Old listing added - should be filtered out
) else if "%choice%"=="5" (
    echo Setting business hours priority test...
    curl -s -X POST %TEST_SERVER%/test/scenario/business-hours
    echo ✅ Business hours listing - should show HIGH priority
) else if "%choice%"=="6" (
    set /p title="Enter announcement title: "
    echo Creating custom announcement...
    curl -s -X POST %TEST_SERVER%/test/announcement -H "Content-Type: application/json" -d "{\"title\": \"!title!\", \"offset_minutes\": 1}"
    echo ✅ Custom announcement created
) else if "%choice%"=="7" (
    echo Clearing custom announcements...
    curl -s -X DELETE %TEST_SERVER%/test/announcements
    echo ✅ All custom announcements cleared
) else if "%choice%"=="8" (
    echo Current test scenario:
    curl -s %TEST_SERVER%/test/scenario
    echo.
) else if "%choice%"=="9" (
    goto cleanup
) else (
    echo Invalid choice. Please try again.
)

goto menu

:cleanup
echo.
echo 🧹 Cleaning up test environment...
curl -s -X DELETE %TEST_SERVER%/test/announcements >nul
curl -s -X POST %TEST_SERVER%/test/scenario/no-new-listings >nul
echo ✅ Test environment reset to baseline

echo.
echo 📊 TEST SUMMARY CHECKLIST
echo ==========================
echo.
echo Verify these behaviors in your detector:
echo.
echo ✅ OLD announcements are filtered out (no false alerts)
echo ✅ NEW announcements trigger "TARGET CRUSHED" alerts  
echo ✅ Detection speeds are under 500ms
echo ✅ Korean timezone timestamps are correct
echo ✅ Business hours show "HIGH" priority
echo ✅ Date filter shows correct baseline comparisons
echo ✅ No regex errors in logs
echo ✅ Smart baseline logic works correctly
echo.
echo 🎯 Expected log patterns:
echo    [DATE_FILTER] ID XXXX is OLD (...) - skipping
echo    [DATE_FILTER] ID XXXX is FUTURE (...) - Priority: HIGH - processing
echo    *** [ULTRA FAST] - XXXms (PRECISE from first_listed_at) ***
echo.

pause