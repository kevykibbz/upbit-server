const express = require("express");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 8000;

// Enable CORS
app.use(cors());
app.use(express.json());

// Korean timezone helper - always KST (UTC+9)
function getKSTTime(offsetMinutes = 0) {
    // Current time in UTC (ms)
    const now = new Date();
    const utcMs = now.getTime() + now.getTimezoneOffset() * 60000;

    // Convert to KST (UTC+9) and apply extra offset
    const kst = new Date(utcMs + (9 * 60 + offsetMinutes) * 60000);

    // Format as ISO8601 with +09:00 (KST)
    const year = kst.getFullYear();
    const month = String(kst.getMonth() + 1).padStart(2, '0');
    const day = String(kst.getDate()).padStart(2, '0');
    const hours = String(kst.getHours()).padStart(2, '0');
    const minutes = String(kst.getMinutes()).padStart(2, '0');
    const seconds = String(kst.getSeconds()).padStart(2, '0');

    return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}+09:00`;
}


// State management
let currentListingId = 10000;
let isNewListingPhase = true; // Alternate between new and old listings
let lastListingTime = Date.now();

// Base old listings (static data that won't trigger detection)
const oldListings = [
    {
        "listed_at": "2025-11-18T15:20:00+09:00",
        "first_listed_at": "2025-11-18T15:20:00+09:00",
        "id": 5769,
        "title": "Market Support for Meteora(MET2) (KRW, BTC, USDT Market)",
        "category": "Trade",
        "need_new_badge": false,
        "need_update_badge": false
    },
    {
        "listed_at": "2025-11-07T17:00:02+09:00",
        "first_listed_at": "2025-11-07T17:00:02+09:00", 
        "id": 5740,
        "title": "랠리(RLY) 원화 마켓 거래 지원",
        "category": "Trade",
        "need_new_badge": false,
        "need_update_badge": false
    },
    {
        "listed_at": "2025-10-25T11:30:00+09:00",
        "first_listed_at": "2025-10-25T11:30:00+09:00",
        "id": 5701,
        "title": "비트코인(BTC) 원화 마켓 거래 지원 종료 예정",
        "category": "Trade", 
        "need_new_badge": false,
        "need_update_badge": false
    }
];

// Current announcements list - starts with old listings
let currentAnnouncements = [...oldListings];

// Generate new listing
function generateNewListing() {
    currentListingId++;
    const cryptos = ['DOGE', 'SHIB', 'PEPE', 'FLOKI', 'BONK', 'WIF', 'POPCAT', 'MEW', 'BRETT', 'MOODENG'];
    const crypto = cryptos[Math.floor(Math.random() * cryptos.length)];
    
    return {
        "listed_at": getKSTTime(1), // 1 minute in future KST
        "first_listed_at": getKSTTime(1),
        "id": currentListingId,
        "title": `🚀 ${crypto}(${crypto}) 신규 상장 (KRW Market)`,
        "category": "Trade",
        "need_new_badge": true,
        "need_update_badge": false
    };
}

// Generate old listing (backdated)
function generateOldListing() {
    currentListingId++;
    const cryptos = ['OLD1', 'OLD2', 'OLD3', 'PAST', 'HIST'];
    const crypto = cryptos[Math.floor(Math.random() * cryptos.length)];
    
    return {
        "listed_at": getKSTTime(-60), // 1 hour in past KST
        "first_listed_at": getKSTTime(-60),
        "id": currentListingId,
        "title": `📜 ${crypto}(${crypto}) 과거 공지사항 (Old Announcement)`,
        "category": "Trade",
        "need_new_badge": false,
        "need_update_badge": false
    };
}

// Auto-update listings every minute
setInterval(() => {
    const now = Date.now();
    if (now - lastListingTime >= 60000) { // 1 minute
        lastListingTime = now;
        
        if (isNewListingPhase) {
            // Add new listing
            const newListing = generateNewListing();
            currentAnnouncements.unshift(newListing); // Add to beginning
            console.log(`🚀 [${getKSTTime()}] NEW LISTING POSTED: ${newListing.title} (ID: ${newListing.id})`);
        } else {
            // Add old listing
            const oldListing = generateOldListing();
            currentAnnouncements.push(oldListing); // Add to end
            console.log(`📜 [${getKSTTime()}] OLD LISTING POSTED: ${oldListing.title} (ID: ${oldListing.id})`);
        }
        
        // Keep only latest 10 announcements
        if (currentAnnouncements.length > 10) {
            currentAnnouncements = currentAnnouncements.slice(0, 10);
        }
        
        // Toggle phase
        isNewListingPhase = !isNewListingPhase;
    }
}, 10000); // Check every 10 seconds

// Main API endpoint - simulate real Upbit API
app.get("/api/v1/announcements", (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const per_page = parseInt(req.query.per_page) || 20;
    const category = req.query.category || '';
    
    console.log(`📡 [${getKSTTime()}] API Request - page: ${page}, per_page: ${per_page}, category: ${category}`);
    
    // Filter by category if specified
    let filteredAnnouncements = currentAnnouncements;
    if (category === 'trade') {
        filteredAnnouncements = currentAnnouncements.filter(a => a.category.toLowerCase() === 'trade');
    }
    
    // Pagination
    const startIndex = (page - 1) * per_page;
    const endIndex = startIndex + per_page;
    const paginatedNotices = filteredAnnouncements.slice(startIndex, endIndex);
    
    const response = {
        "success": true,
        "data": {
            "total_pages": Math.ceil(filteredAnnouncements.length / per_page),
            "total_count": filteredAnnouncements.length,
            "notices": paginatedNotices,
            "fixed_notices": []
        }
    };
    
    console.log(`✅ [${getKSTTime()}] Returning ${paginatedNotices.length} announcements`);
    res.json(response);
});

// Control endpoints for testing
app.post("/control/new-listing-now", (req, res) => {
    const newListing = generateNewListing();
    currentAnnouncements.unshift(newListing);
    console.log(`🎯 [${getKSTTime()}] MANUAL NEW LISTING: ${newListing.title} (ID: ${newListing.id})`);
    
    res.json({
        success: true,
        action: "new-listing-posted",
        kst_time: getKSTTime(),
        listing: newListing
    });
});

app.post("/control/old-listing-now", (req, res) => {
    const oldListing = generateOldListing();
    currentAnnouncements.push(oldListing);
    console.log(`🎯 [${getKSTTime()}] MANUAL OLD LISTING: ${oldListing.title} (ID: ${oldListing.id})`);
    
    res.json({
        success: true,
        action: "old-listing-posted", 
        kst_time: getKSTTime(),
        listing: oldListing
    });
});

app.get("/control/status", (req, res) => {
    res.json({
        server: "Korean Upbit Simulator",
        timezone: "KST (UTC+9)",
        current_time: getKSTTime(),
        total_announcements: currentAnnouncements.length,
        next_phase: isNewListingPhase ? "new-listing" : "old-listing",
        current_listing_id: currentListingId
    });
});

app.get("/health", (req, res) => {
    res.json({
        status: "healthy",
        service: "Korean Upbit Simulator",
        timezone: "KST (UTC+9)",
        kst_time: getKSTTime(),
        announcements_count: currentAnnouncements.length,
        version: "1.0.0"
    });
});

app.listen(PORT, () => {
    console.log(`🇰🇷 Korean Upbit Simulator running on http://localhost:${PORT}`);
    console.log(`🕒 Korean timezone: ${getKSTTime()}`);
    console.log(`📋 API endpoint: http://localhost:${PORT}/api/v1/announcements`);
    console.log(`🎮 Control panel: http://localhost:${PORT}/control/status`);
    console.log(``);
    console.log(`🔧 Control Commands:`);
    console.log(`  curl -X POST http://localhost:${PORT}/control/new-listing-now`);
    console.log(`  curl -X POST http://localhost:${PORT}/control/old-listing-now`);
    console.log(`  curl http://localhost:${PORT}/control/status`);
    console.log(``);
    console.log(`🔄 Auto-posting: New/Old listings every 60 seconds`);
    console.log(`📊 Starting with ${currentAnnouncements.length} base announcements`);
});