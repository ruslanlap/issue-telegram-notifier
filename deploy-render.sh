#!/bin/bash

# Configuration - Loaded from Environment Variables
# Do NOT hardcode secrets here! Use 'export RENDER_API_KEY=...' in your terminal
API_KEY="${RENDER_API_KEY}"
REPO_URL="https://github.com/ruslanlap/issue-telegram-notifier"
SERVICE_NAME="github-telegram-notifier"

if [ -z "$API_KEY" ]; then
    echo "❌ Error: RENDER_API_KEY environment variable is not set."
    echo "Usage: export RENDER_API_KEY=your_key && ./deploy-render.sh"
    exit 1
fi

echo "🚀 Starting CLI deployment to Render..."

# 1. Get Owner ID
echo "🔍 Fetching Owner ID..."
OWNER_ID=$(curl -s -H "Authorization: Bearer $API_KEY" https://api.render.com/v1/owners | grep -oP '"id":"\K[^"]+' | head -1)

if [ -z "$OWNER_ID" ]; then
    echo "❌ Error: Could not fetch Owner ID. Check your API key."
    exit 1
fi

echo "✅ Owner ID: $OWNER_ID"

# 2. Create Web Service
echo "📡 Creating Web Service: $SERVICE_NAME..."

# Prepare JSON payload (Variables should be set in Render Dashboard or via blueprint)
PAYLOAD=$(cat <<EOF
{
  "type": "web_service",
  "name": "$SERVICE_NAME",
  "ownerId": "$OWNER_ID",
  "repo": "$REPO_URL",
  "autoDeploy": "yes",
  "serviceDetails": {
    "env": "node",
    "buildCommand": "npm install",
    "startCommand": "npm start",
    "plan": "free",
    "region": "oregon",
    "envVars": [
      { "key": "PORT", "value": "3000" }
    ]
  }
}
EOF
)

RESPONSE=$(curl -s -X POST \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d "$PAYLOAD" \
  https://api.render.com/v1/services)

SERVICE_ID=$(echo "$RESPONSE" | grep -oP '"id":"\K[^"]+' | head -1)

if [ -z "$SERVICE_ID" ]; then
    echo "❌ Error creating service:"
    echo "$RESPONSE"
    exit 1
fi

echo "✅ Service created successfully!"
echo "🆔 Service ID: $SERVICE_ID"
echo "🌐 URL: https://$SERVICE_NAME.onrender.com"
echo "📜 Note: You must manually set TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID, and WEBHOOK_SECRET in Render Dashboard."
