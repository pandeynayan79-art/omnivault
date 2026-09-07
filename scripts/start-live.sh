#!/usr/bin/env bash
# OmniVault 24/7 Live Runner & Network Share Utility

PORT=${PORT:-3000}
HOST="0.0.0.0"

echo "========================================================"
echo "          OmniVault — Digital Garden & Media Vault      "
echo "========================================================"

LOCAL_IP=$(ipconfig getifaddr en0 2>/dev/null || ipconfig getifaddr en1 2>/dev/null || hostname -I 2>/dev/null | awk '{print $1}' || echo "localhost")

echo "Owner Email:     paneynayan79@gmail.com"
echo "Owner Password:  11223344"
echo "Local Access:    http://localhost:${PORT}"
echo "Network Share:   http://${LOCAL_IP}:${PORT}"
echo "========================================================"
echo "Anyone on your Wi-Fi/LAN can open: http://${LOCAL_IP}:${PORT}"
echo "Visitors can register their own account or add books as guests!"
echo "--------------------------------------------------------"
echo "To share globally across the internet for free (Cloudflare Tunnel):"
echo "Run in a terminal: npx cloudflared tunnel --url http://localhost:${PORT}"
echo "========================================================"

# Check if port is already serving OmniVault
if lsof -Pi :${PORT} -sTCP:LISTEN -t >/dev/null ; then
  echo "OmniVault is already running and live on port ${PORT}!"
  echo "Ready for you and your friends at http://${LOCAL_IP}:${PORT}"
  exit 0
fi

echo "Starting OmniVault production server on ${HOST}:${PORT}..."
exec npx next start -H ${HOST} -p ${PORT}
