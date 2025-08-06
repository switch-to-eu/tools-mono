#!/bin/bash
set -e

echo "🚀 Starting CoTURN TURN Server"

# Get external IP
EXTERNAL_IP=${SLIPLANE_DOMAIN:-$(curl -s ifconfig.me || echo "127.0.0.1")}
echo "📍 Using external IP: $EXTERNAL_IP"

# Create writable copy of config in /tmp
cp /etc/coturn/turnserver.conf /tmp/turnserver.conf

# Fix log file permissions - use /tmp for logs
sed -i "s|log-file=/var/log/turnserver.log|log-file=/tmp/turnserver.log|" /tmp/turnserver.conf

# Configure external IP
sed -i "s/# external-ip=/external-ip=$EXTERNAL_IP/" /tmp/turnserver.conf

# Ensure we bind to all interfaces (required for Sliplane)
echo "listening-ip=0.0.0.0" >> /tmp/turnserver.conf

# Configure authentication - use EITHER username/password OR shared secret, not both
if [ -n "$TURN_USERNAME" ] && [ -n "$TURN_PASSWORD" ]; then
  echo "🔐 Configuring username/password authentication"
  sed -i "s/# user=USERNAME:PASSWORD/user=$TURN_USERNAME:$TURN_PASSWORD/" /tmp/turnserver.conf
  # Remove auth secret to avoid conflict
  sed -i "/use-auth-secret/d" /tmp/turnserver.conf
  sed -i "/# static-auth-secret=SECRET/d" /tmp/turnserver.conf
  echo "📝 Using long-term credential mechanism only"
elif [ -n "$TURN_SECRET" ]; then
  echo "🔑 Configuring shared secret authentication"
  sed -i "s/# static-auth-secret=SECRET/static-auth-secret=$TURN_SECRET/" /tmp/turnserver.conf
  # Remove username/password to avoid conflict
  sed -i "/# user=USERNAME:PASSWORD/d" /tmp/turnserver.conf
  sed -i "/lt-cred-mech/d" /tmp/turnserver.conf
  echo "📝 Using shared secret mechanism only"
else
  echo "⚠️ Warning: No authentication configured (TURN_USERNAME/TURN_PASSWORD or TURN_SECRET)"
fi

if [ -n "$TURN_REALM" ]; then
  sed -i "s/realm=nully.app/realm=$TURN_REALM/" /tmp/turnserver.conf
fi

# Add relay port range for proper operation
echo "" >> /tmp/turnserver.conf
echo "# Relay port range" >> /tmp/turnserver.conf
echo "min-port=49160" >> /tmp/turnserver.conf
echo "max-port=49200" >> /tmp/turnserver.conf

# Disable problematic features that cause warnings
echo "" >> /tmp/turnserver.conf
echo "# Disable features causing issues" >> /tmp/turnserver.conf
echo "no-dtls" >> /tmp/turnserver.conf
echo "no-tls" >> /tmp/turnserver.conf

echo "✅ Configuration complete - showing final config:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
cat /tmp/turnserver.conf
exec /usr/bin/turnserver -c /tmp/turnserver.conf --listening-port=3478 --verbose