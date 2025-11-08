const express = require("express");
const axios = require("axios");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 3000;

// Automatically pick target URL (can override in .env or cloud config)
const TARGET_URL =
  process.env.TARGET_URL ||
  "https://api-manager.upbit.com/api/v1/announcements";

// Enable CORS and JSON parsing
app.use(cors());
app.use(express.json());

// Relay endpoint
app.get("/api/v1/announcements", async (req, res) => {
  try {
    console.log(
      `[${new Date().toISOString()}] Relay request received from ${req.ip}`
    );
    console.log("Query params:", req.query);

    const upbitResponse = await axios.get(TARGET_URL, {
      params: req.query,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36",
        Accept: "application/json, text/plain, */*",
        "Accept-Language": "en-US,en;q=0.9,ko;q=0.8",
        Referer: "https://upbit.com/",
        Origin: "https://upbit.com",
        Connection: "keep-alive",
        "Cache-Control": "no-cache",
        Pragma: "no-cache",
      },
      timeout: 10000,
    });

    console.log(
      `[${new Date().toISOString()}] Upbit responded with status: ${
        upbitResponse.status
      }`
    );
    res.status(upbitResponse.status).json(upbitResponse.data);
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Relay error:`, error.message);

    if (error.response) {
      res.status(error.response.status).json({
        error: "Upbit API error",
        status: error.response.status,
        message: error.message,
      });
    } else if (error.code === "ECONNABORTED") {
      res.status(408).json({
        error: "Request timeout",
        message: "Upbit API did not respond within timeout",
      });
    } else {
      res.status(500).json({
        error: "Relay server error",
        message: error.message,
      });
    }
  }
});

// Health endpoint
app.get("/health", (req, res) => {
  res.json({
    status: "healthy",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: "1.1.0",
    target: TARGET_URL,
  });
});

// Root endpoint
app.get("/", (req, res) => {
  res.json({
    service: "Upbit Announcement Relay Server",
    version: "1.1.0",
    environment: process.env.NODE_ENV || "development",
    endpoints: {
      announcements:
        "/api/v1/announcements?os=web&page=1&per_page=1&category=trade",
      health: "/health",
    },
    target: TARGET_URL,
  });
});

app.listen(PORT, () => {
  // Detect host dynamically from environment or default to localhost
  const host = process.env.HOST || "localhost";
  const protocol = process.env.PROTOCOL || "http";
  const baseUrl = `${protocol}://${host}:${PORT}`;

  const fullEndpoint = `${baseUrl}/api/v1/announcements?os=web&page=1&per_page=1&category=trade`;

  console.log(`🚀 Upbit Relay Server running on port ${PORT}`);
  console.log(
    `📡 Proxying requests to: https://api-manager.upbit.com/api/v1/announcements`
  );
  console.log(`🌐 Health check: ${baseUrl}/health`);
  console.log(`📋 API endpoint: ${fullEndpoint}`);
});

// Graceful shutdown
process.on("SIGTERM", () => {
  console.log("🛑 Received SIGTERM, shutting down gracefully...");
  process.exit(0);
});

process.on("SIGINT", () => {
  console.log("🛑 Received SIGINT, shutting down gracefully...");
  process.exit(0);
});
