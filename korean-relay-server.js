const express = require("express");
const cors = require("cors");
const axios = require("axios");

const app = express();
const PORT = process.env.PORT || 9000;

// Enable CORS
app.use(cors());
app.use(express.json());

// Configuration
const KOREAN_SERVER_URL = "http://localhost:8000";
const RELAY_TIMEZONE = "UTC";

// UTC timezone helper
function getUTCTime(offsetMinutes = 0) {
    const now = new Date();
    now.setUTCMinutes(now.getUTCMinutes() + offsetMinutes);
    return now.toISOString();
}

// Log helper with UTC timestamp
function logWithTimestamp(message) {
    const utcTime = getUTCTime();
    console.log(`[${utcTime}] ${message}`);
}

// Health endpoint
app.get("/health", (req, res) => {
    res.json({
        status: "healthy",
        service: "Korean Relay Server",
        timezone: RELAY_TIMEZONE,
        utc_time: getUTCTime(),
        korean_server: KOREAN_SERVER_URL,
        version: "1.0.0"
    });
});

// Main relay endpoint - forwards requests to Korean server
app.get("/api/v1/announcements", async (req, res) => {
    try {
        logWithTimestamp(`🔄 RELAY REQUEST: Forwarding to Korean server ${KOREAN_SERVER_URL}/api/v1/announcements`);
        
        // Forward query parameters to Korean server
        const queryParams = new URLSearchParams(req.query).toString();
        const koreanUrl = `${KOREAN_SERVER_URL}/api/v1/announcements${queryParams ? '?' + queryParams : ''}`;
        
        // Make request to Korean server
        const startTime = Date.now();
        const response = await axios.get(koreanUrl, {
            timeout: 5000,
            headers: {
                'User-Agent': 'Korean-Relay-Server/1.0.0',
                'Accept': 'application/json'
            }
        });
        
        const duration = Date.now() - startTime;
        
        // Log the relay operation
        logWithTimestamp(`✅ RELAY SUCCESS: Korean server responded in ${duration}ms`);
        logWithTimestamp(`📊 Data relayed: ${response.data.data.notices.length} announcements`);
        
        // Add relay headers for debugging
        res.set({
            'X-Relay-Server': 'Korean-Relay-UTC',
            'X-Relay-Timestamp': getUTCTime(),
            'X-Relay-Duration': `${duration}ms`,
            'X-Korean-Server': KOREAN_SERVER_URL
        });
        
        // Forward the exact response from Korean server
        res.json(response.data);
        
    } catch (error) {
        logWithTimestamp(`❌ RELAY ERROR: ${error.message}`);
        
        if (error.code === 'ECONNREFUSED') {
            res.status(503).json({
                error: "Korean server unavailable",
                message: "Cannot connect to Korean Upbit server",
                korean_server: KOREAN_SERVER_URL,
                relay_time: getUTCTime()
            });
        } else if (error.code === 'ETIMEDOUT') {
            res.status(504).json({
                error: "Korean server timeout",
                message: "Korean server took too long to respond",
                timeout: "5000ms",
                relay_time: getUTCTime()
            });
        } else {
            res.status(500).json({
                error: "Relay server error",
                message: error.message,
                relay_time: getUTCTime()
            });
        }
    }
});

// Status endpoint for monitoring
app.get("/relay/status", (req, res) => {
    res.json({
        service: "Korean Relay Server",
        status: "running",
        timezone: RELAY_TIMEZONE,
        utc_time: getUTCTime(),
        korean_server: {
            url: KOREAN_SERVER_URL,
            endpoint: "/api/v1/announcements"
        },
        relay_info: {
            purpose: "Simulate real-world UTC servers relaying Korean data",
            timezone_simulation: "UTC (cloud servers)",
            target_detector: "KST timezone detector"
        }
    });
});

// Test endpoint to check Korean server connectivity
app.get("/relay/test", async (req, res) => {
    try {
        logWithTimestamp("🧪 RELAY TEST: Testing Korean server connectivity...");
        
        const startTime = Date.now();
        const response = await axios.get(`${KOREAN_SERVER_URL}/health`, {
            timeout: 3000
        });
        const duration = Date.now() - startTime;
        
        logWithTimestamp(`✅ RELAY TEST SUCCESS: Korean server healthy (${duration}ms)`);
        
        res.json({
            test_result: "success",
            korean_server_status: "healthy",
            response_time: `${duration}ms`,
            korean_server_data: response.data,
            relay_time: getUTCTime()
        });
        
    } catch (error) {
        logWithTimestamp(`❌ RELAY TEST FAILED: ${error.message}`);
        
        res.status(503).json({
            test_result: "failed",
            korean_server_status: "unreachable",
            error: error.message,
            relay_time: getUTCTime()
        });
    }
});

// 404 handler
app.use("*", (req, res) => {
    logWithTimestamp(`❓ UNKNOWN REQUEST: ${req.method} ${req.originalUrl}`);
    res.status(404).json({
        error: "Endpoint not found",
        available_endpoints: [
            "GET /api/v1/announcements - Main relay endpoint",
            "GET /health - Health check",
            "GET /relay/status - Relay server status", 
            "GET /relay/test - Test Korean server connectivity"
        ],
        relay_time: getUTCTime()
    });
});

// Error handler
app.use((err, req, res, next) => {
    logWithTimestamp(`💥 SERVER ERROR: ${err.message}`);
    res.status(500).json({
        error: "Internal relay server error",
        message: err.message,
        relay_time: getUTCTime()
    });
});

// Start server
app.listen(PORT, () => {
    console.log("🌍 Korean Relay Server (UTC) running on http://localhost:" + PORT);
    console.log("🕒 UTC timezone:", getUTCTime());
    console.log("🇰🇷 Korean server:", KOREAN_SERVER_URL);
    console.log("📋 Main endpoint: http://localhost:" + PORT + "/api/v1/announcements");
    console.log("🎮 Status panel: http://localhost:" + PORT + "/relay/status");
    console.log("");
    console.log("🔧 Test Commands:");
    console.log("  curl http://localhost:" + PORT + "/health");
    console.log("  curl http://localhost:" + PORT + "/relay/test");
    console.log("  curl http://localhost:" + PORT + "/api/v1/announcements");
    console.log("");
    console.log("🔄 Relay Architecture:");
    console.log("  Detector (KST) → Korean Relay (UTC) → Korean Server (KST)");
});