#!/bin/bash
set -e

echo "🚀 Starting CoTURN TURN Server"

# Get external IP
EXTERNAL_IP=${SLIPLANE_DOMAIN:-$(curl -s ifconfig.me || echo "127.0.0.1")}
echo "📍 Using external IP: $EXTERNAL_IP"

# Create writable copy of config in /tmp
cp /etc/coturn/turnserver.conf /tmp/turnserver.conf

# Configure external IP
sed -i "s/# external-ip=/external-ip=$EXTERNAL_IP/" /tmp/turnserver.conf

# Configure authentication from environment variables
if [ -n "$TURN_USERNAME" ] && [ -n "$TURN_PASSWORD" ]; then
  echo "🔐 Configuring user authentication"
  sed -i "s/# user=USERNAME:PASSWORD/user=$TURN_USERNAME:$TURN_PASSWORD/" /tmp/turnserver.conf
else
  echo "⚠️ Warning: No user credentials provided (TURN_USERNAME/TURN_PASSWORD)"
fi

if [ -n "$TURN_SECRET" ]; then
  echo "🔑 Configuring auth secret"
  sed -i "s/# static-auth-secret=SECRET/static-auth-secret=$TURN_SECRET/" /tmp/turnserver.conf
else
  echo "⚠️ Warning: No auth secret provided (TURN_SECRET)"
fi

if [ -n "$TURN_REALM" ]; then
  sed -i "s/realm=nully.app/realm=$TURN_REALM/" /tmp/turnserver.conf
fi

echo "✅ Configuration complete"
exec /usr/bin/turnserver -c /tmp/turnserver.conf --listening-port=3478 --verbose