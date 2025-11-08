# Upbit Relay Server Deployment Guide

## Overview
This relay server bypasses CloudFlare restrictions when accessing Upbit API from AWS EC2 or other blocked IPs.

## Deployment Options

### Option 1: Vercel (Recommended)
1. Install Vercel CLI: `npm i -g vercel`
2. Login: `vercel login`
3. Deploy: `vercel --prod`
4. Your relay URL will be: `https://your-project.vercel.app`

### Option 2: Heroku
1. Install Heroku CLI: https://devcenter.heroku.com/articles/heroku-cli
2. Create app: `heroku create your-app-name`
3. Deploy: `git push heroku main`
4. Your relay URL will be: `https://your-app-name.herokuapp.com`

### Option 3: Railway
1. Connect GitHub repo to Railway: https://railway.app
2. Deploy automatically on push

## Using with C++ Detector

Update your C++ detector environment or command line:

### Environment Variable
```bash
export RELAY_API_URL="https://your-deployed-relay.vercel.app"
```

### Command Line
```bash
./ultra_fast_detector --relay https://your-deployed-relay.vercel.app
```

## Testing the Relay

Test the relay is working:
```bash
curl https://your-deployed-relay.vercel.app/health
curl "https://your-deployed-relay.vercel.app/api/v1/announcements?market=KRW-BTC"
```

## Environment Variables (Optional)

For production, you can set these in your deployment platform:
- `NODE_ENV=production`
- `PORT=3000` (usually auto-configured by platform)

## Local Development

1. Install dependencies: `npm install`
2. Start development server: `npm run dev`
3. Test locally: `curl http://localhost:3000/health`

## Troubleshooting

- **503 errors**: Check if Upbit API is accessible from your deployment platform
- **CORS issues**: The relay includes CORS headers for browser access
- **Rate limiting**: The relay doesn't implement rate limiting, but Upbit may have limits

## Security Notes

- This relay doesn't require authentication
- All requests are proxied directly to Upbit
- No data is stored or logged
- Use HTTPS URLs for production