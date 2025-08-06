#!/bin/bash
set -e

# CoTURN Dynamic Configuration for Sliplane
echo "🚀 Starting CoTURN TURN Server on Sliplane..."

# Get external IP from Sliplane environment or detect it
EXTERNAL_IP=${SLIPLANE_DOMAIN:-${EXTERNAL_IP:-$(curl -s ifconfig.me || curl -s ipinfo.io/ip || echo "127.0.0.1")}}

echo "📍 Using external IP/domain: $EXTERNAL_IP"

# Create dynamic configuration
cat > /tmp/turnserver-dynamic.conf << EOF
# CoTURN Configuration for Sliplane - Auto-generated
listening-port=3478
tls-listening-port=5349
alt-listening-port=80
alt-tls-listening-port=443

# Use Sliplane domain or external IP
external-ip=$EXTERNAL_IP
relay-ip=0.0.0.0

# Authentication (configured from environment variables)
user=${TURN_USERNAME:-nully}:${TURN_PASSWORD:-changeme}
use-auth-secret
static-auth-secret=${TURN_SECRET:-change-this-secret}

# Security
fingerprint
lt-cred-mech

# Performance
max-bps=${TURN_MAX_BPS:-100000}
total-quota=${TURN_TOTAL_QUOTA:-100}
user-quota=${TURN_USER_QUOTA:-50}

# Relay configuration
no-udp-relay=false
no-tcp-relay=false

# Logging
verbose
log-file=/var/log/coturn/turnserver.log

# Security settings
no-cli
no-loopback-peers
no-multicast-peers
stun-only=false
mobility
keep-address-family

# Realm
realm=${TURN_REALM:-nully.app}

# Port ranges for relay
min-port=49160
max-port=49200

# Production settings
prod
check-origin-consistency

# Additional security
no-tlsv1
no-tlsv1_1
cipher-list="ECDHE-RSA-AES256-GCM-SHA384:ECDHE-RSA-AES128-GCM-SHA256"
EOF

# Merge with base configuration if it exists
if [ -f "/etc/coturn/turnserver.conf" ]; then
    echo "📝 Merging with base configuration..."
    cat /etc/coturn/turnserver.conf /tmp/turnserver-dynamic.conf > /tmp/turnserver-final.conf
else
    cp /tmp/turnserver-dynamic.conf /tmp/turnserver-final.conf
fi

# Create log directory and set permissions
mkdir -p /var/log/coturn
touch /var/log/coturn/turnserver.log

# Display configuration for debugging
echo "🔧 TURN Server Configuration:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "External IP/Domain: $EXTERNAL_IP"
echo "TURN UDP: turn:$EXTERNAL_IP:3478" 
echo "TURN TCP: turn:$EXTERNAL_IP:3478?transport=tcp"
echo "TURN TLS: turns:$EXTERNAL_IP:5349"
echo "Alt Port 80: turn:$EXTERNAL_IP:80"
echo "Alt Port 443: turn:$EXTERNAL_IP:443?transport=tcp"
echo "Username: ${TURN_USERNAME:-nully}"
echo "Password: ${TURN_PASSWORD:-nully123!@#}"
echo "Realm: ${TURN_REALM:-nully.app}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Start CoTURN with dynamic configuration
echo "🌟 Starting CoTURN TURN server..."
exec /usr/bin/turnserver -c /tmp/turnserver-final.conf --listening-port=3478 --verbose