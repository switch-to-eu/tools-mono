#!/bin/bash

# CoTURN Setup Script for Nully App
# This script sets up the CoTURN TURN server

set -e

echo "🚀 Setting up CoTURN TURN Server for Nully..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo -e "${RED}❌ Docker is not installed. Please install Docker first.${NC}"
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    echo -e "${RED}❌ Docker Compose is not installed. Please install Docker Compose first.${NC}"
    exit 1
fi

# Get the external IP address
echo -e "${BLUE}🌐 Detecting external IP address...${NC}"
EXTERNAL_IP=$(curl -s ifconfig.me || curl -s ipinfo.io/ip || echo "")

if [ -z "$EXTERNAL_IP" ]; then
    echo -e "${YELLOW}⚠️  Could not detect external IP automatically.${NC}"
    read -p "Please enter your server's public IP address: " EXTERNAL_IP
fi

echo -e "${GREEN}📍 Using external IP: $EXTERNAL_IP${NC}"

# Create .env file
echo -e "${BLUE}📝 Creating .env file...${NC}"
cat > .env << EOF
# CoTURN Configuration - Generated $(date)
EXTERNAL_IP=$EXTERNAL_IP
TURN_USERNAME=nully
TURN_PASSWORD=nully123!@#
TURN_SECRET=nully-super-secret-key-2025
TURN_REALM=nully.app
TURN_PORT=3478
TURN_TLS_PORT=5349
TURN_ALT_PORT=80
TURN_ALT_TLS_PORT=443
TURN_MAX_BPS=100000
TURN_TOTAL_QUOTA=100
TURN_USER_QUOTA=50
EOF

# Create logs directory
mkdir -p logs
chmod 755 logs

# Create certs directory for future TLS setup
mkdir -p certs
chmod 700 certs

# Update turnserver.conf with external IP
echo -e "${BLUE}🔧 Updating configuration with external IP...${NC}"
if [ ! -f "turnserver.conf.backup" ]; then
    cp turnserver.conf turnserver.conf.backup
fi

sed -i "s/# external-ip=YOUR_SERVER_PUBLIC_IP/external-ip=$EXTERNAL_IP/" turnserver.conf

# Check if ports are available
echo -e "${BLUE}🔍 Checking port availability...${NC}"
for port in 3478 5349 80 443; do
    if netstat -tuln 2>/dev/null | grep -q ":$port "; then
        echo -e "${YELLOW}⚠️  Port $port is already in use. You may need to stop other services.${NC}"
    else
        echo -e "${GREEN}✅ Port $port is available${NC}"
    fi
done

# Start the TURN server
echo -e "${BLUE}🚀 Starting CoTURN TURN Server...${NC}"
docker-compose up -d

# Wait for service to start
echo -e "${BLUE}⏳ Waiting for TURN server to start...${NC}"
sleep 10

# Check if the service is running
if docker-compose ps | grep -q "Up"; then
    echo -e "${GREEN}✅ CoTURN TURN Server is running!${NC}"
    
    # Display connection information
    echo -e "\n${GREEN}📋 TURN Server Information:${NC}"
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${GREEN}Server IP:${NC}      $EXTERNAL_IP"
    echo -e "${GREEN}TURN UDP:${NC}       turn:$EXTERNAL_IP:3478"
    echo -e "${GREEN}TURN TCP:${NC}       turn:$EXTERNAL_IP:3478?transport=tcp"  
    echo -e "${GREEN}TURN TLS:${NC}       turns:$EXTERNAL_IP:5349"
    echo -e "${GREEN}Alt Port 80:${NC}    turn:$EXTERNAL_IP:80"
    echo -e "${GREEN}Alt Port 443:${NC}   turn:$EXTERNAL_IP:443?transport=tcp"
    echo -e "${GREEN}Username:${NC}       nully"
    echo -e "${GREEN}Password:${NC}       nully123!@#"
    echo -e "${GREEN}Realm:${NC}          nully.app"
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    
    # Test TURN server
    echo -e "\n${BLUE}🧪 Testing TURN server...${NC}"
    timeout 5 nc -u -z $EXTERNAL_IP 3478 && echo -e "${GREEN}✅ UDP port 3478 is accessible${NC}" || echo -e "${RED}❌ UDP port 3478 is not accessible${NC}"
    timeout 5 nc -z $EXTERNAL_IP 3478 && echo -e "${GREEN}✅ TCP port 3478 is accessible${NC}" || echo -e "${RED}❌ TCP port 3478 is not accessible${NC}"
    timeout 5 nc -z $EXTERNAL_IP 80 && echo -e "${GREEN}✅ TCP port 80 is accessible${NC}" || echo -e "${RED}❌ TCP port 80 is not accessible${NC}"
    
    # Instructions for Nully app
    echo -e "\n${YELLOW}📝 Next Steps:${NC}"
    echo -e "1. Add these environment variables to your Nully app:"
    echo -e "   ${BLUE}NEXT_PUBLIC_CUSTOM_TURN_SERVER=${EXTERNAL_IP}${NC}"
    echo -e "   ${BLUE}NEXT_PUBLIC_CUSTOM_TURN_USERNAME=nully${NC}"
    echo -e "   ${BLUE}NEXT_PUBLIC_CUSTOM_TURN_PASSWORD=nully123!@#${NC}"
    echo -e ""
    echo -e "2. Update your firewall to allow these ports:"
    echo -e "   - UDP 3478 (TURN)"
    echo -e "   - TCP 3478 (TURN TCP)"
    echo -e "   - TCP 80 (TURN Alt)"
    echo -e "   - TCP 443 (TURN TLS Alt)"
    echo -e "   - UDP 49160-49200 (RTP relay)"
    echo -e ""
    echo -e "3. For production, consider:"
    echo -e "   - Setting up SSL certificates"
    echo -e "   - Using a database for user management"
    echo -e "   - Configuring proper firewall rules"
    echo -e ""
    echo -e "${GREEN}🎉 Setup complete! Your TURN server is ready to use.${NC}"
    
else
    echo -e "${RED}❌ Failed to start CoTURN TURN Server${NC}"
    echo -e "${YELLOW}📋 Checking logs...${NC}"
    docker-compose logs
    exit 1
fi

# Show logs location
echo -e "\n${BLUE}📄 Logs are available at: ./logs/turnserver.log${NC}"
echo -e "${BLUE}🔧 To view live logs: docker-compose logs -f${NC}"
echo -e "${BLUE}🛑 To stop server: docker-compose down${NC}"
echo -e "${BLUE}🔄 To restart server: docker-compose restart${NC}"