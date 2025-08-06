# CoTURN TURN Server Deployment on Sliplane

This directory contains the configuration and deployment files for hosting a CoTURN TURN server on Sliplane.

## 🚀 Quick Deployment

### Step 1: Push to GitHub
1. Push this directory structure to your GitHub repository
2. Make sure all files are in the same directory (`apps/nully/docker/coturn/`)

### Step 2: Deploy on Sliplane

#### Option A: Using Standalone Dockerfile (Recommended)
1. Go to [Sliplane Dashboard](https://console.sliplane.io/)
2. Click **"Deploy from GitHub"**
3. Select your repository
4. Set **Build Context**: `/apps/nully/docker/coturn/`
5. Set **Dockerfile**: `Dockerfile.sliplane`
6. Configure the service:

#### Option B: Using Separate Files
1. Go to [Sliplane Dashboard](https://console.sliplane.io/)
2. Click **"Deploy from GitHub"**
3. Select your repository
4. Set **Build Context**: `/apps/nully/docker/coturn/` (important!)
5. Set **Dockerfile**: `Dockerfile`
6. Configure the service:

#### Service Configuration:
- **Service Name**: `nully-turn-server`
- **Port**: `3478` (main TURN port)
- **Protocol**: `TCP` (Sliplane requirement)
- **Health Check**: `/` (optional)

#### Environment Variables (REQUIRED for Security):
```bash
# 🚨 SECURITY: These credentials are NOT stored in the repository
# Set these in your Sliplane environment variables
TURN_USERNAME=your-username
TURN_PASSWORD=your-secure-password-123
TURN_SECRET=your-super-secret-key-2025
TURN_REALM=yourdomain.com
TURN_MAX_BPS=100000
TURN_TOTAL_QUOTA=100
TURN_USER_QUOTA=50
```

**⚠️ IMPORTANT**: Never commit credentials to your repository. These must be configured as environment variables in Sliplane.

### Step 3: Configure Your Nully App
Once deployed, update your Nully app environment variables:

```bash
# Replace YOUR_SLIPLANE_DOMAIN with your actual Sliplane domain
NEXT_PUBLIC_CUSTOM_TURN_SERVER=your-app-name.sliplane.app
NEXT_PUBLIC_CUSTOM_TURN_USERNAME=your-username
NEXT_PUBLIC_CUSTOM_TURN_PASSWORD=your-secure-password-123
NEXT_PUBLIC_USE_CUSTOM_TURN=true

# 🚨 SECURITY: Use the same credentials you set in Sliplane environment
```

## 📋 Available TURN Endpoints

After deployment, your TURN server will be available at:

- **TURN UDP**: `turn:your-app-name.sliplane.app:3478`
- **TURN TCP**: `turn:your-app-name.sliplane.app:3478?transport=tcp`
- **TURN TLS**: `turns:your-app-name.sliplane.app:5349`
- **Alt Port 80**: `turn:your-app-name.sliplane.app:80`
- **Alt Port 443**: `turn:your-app-name.sliplane.app:443?transport=tcp`

## 🔧 Configuration Details

### Dockerfile Features:
- Based on official `coturn/coturn:4.6.2` image
- Exposes all necessary TURN ports (3478, 5349, 80, 443)
- RTP relay port range (49160-49200)
- Health check for service monitoring
- Runs as non-root user for security

### Dynamic Configuration:
- Auto-detects Sliplane domain via `SLIPLANE_DOMAIN` environment variable
- Falls back to external IP detection if domain not available
- Configurable via environment variables
- Supports both static credentials and auth secrets

### Security Features:
- TLS/DTLS support
- Modern cipher suites only
- No deprecated TLS versions
- Origin consistency checking
- Fingerprinting enabled

## 🧪 Testing Your TURN Server

### Option 1: Use Nully's Built-in Tester
1. Go to your Nully app: `https://your-nully-app.com/test`
2. The test will automatically include your custom TURN server
3. Look for successful "relay" candidates

### Option 2: Manual Testing with WebRTC
```javascript
const pc = new RTCPeerConnection({
  iceServers: [
    {
      urls: 'turn:your-app-name.sliplane.app:3478',
      username: 'nully',
      credential: 'your-secure-password-123'
    }
  ]
});
```

### Option 3: Command Line Testing
```bash
# Test if port is open
nc -zv your-app-name.sliplane.app 3478

# Test TURN server with turnutils
turnutils_uclient -T -u nully -w your-password your-app-name.sliplane.app
```

## 🚨 Important Notes

### Sliplane Limitations:
- Containers are **ephemeral** - use volumes for persistent data
- **Network isolation** - services can't communicate directly
- **Resource limits** apply based on your plan
- **Domain-based routing** - all traffic goes through Sliplane proxy

### TURN Server Considerations:
- **UDP Support**: Sliplane may have limitations with UDP traffic
- **Port Restrictions**: Only TCP ports may work reliably
- **Load Balancing**: May affect peer-to-peer connections
- **Resource Usage**: TURN servers are resource-intensive

### Recommended Configuration:
- Use **TCP transport** for better Sliplane compatibility
- Set reasonable **quotas** to prevent resource exhaustion  
- Monitor **logs** for connection issues
- Consider **dedicated server** for production workloads

## 🔍 Troubleshooting

### Common Issues:

1. **"Connection refused"**
   - Check if service is running: Sliplane logs
   - Verify port configuration matches Dockerfile
   - Ensure environment variables are set

2. **"No relay candidates found"**  
   - Check TURN credentials match exactly
   - Verify external IP/domain is correct
   - Test with TCP transport first

3. **"Service won't start"**
   - Check Dockerfile syntax
   - Verify entrypoint.sh is executable
   - Review Sliplane build logs

4. **"High resource usage"**
   - Reduce user/total quotas
   - Limit concurrent connections
   - Monitor Sliplane metrics

### Debug Commands:
```bash
# View logs
docker logs your-container-name

# Check listening ports
netstat -tuln | grep -E ':(3478|5349|80|443)'

# Test TURN allocation
turnutils_uclient -v -t -T -u nully -w password your-domain.sliplane.app
```

## 💡 Production Recommendations

1. **Use Strong Credentials**: Change default passwords
2. **Enable TLS**: Configure SSL certificates for production
3. **Monitor Resources**: Set up alerts for high CPU/memory usage
4. **Database Backend**: Consider PostgreSQL for user management
5. **Rate Limiting**: Implement connection throttling
6. **Logging**: Set up centralized log collection
7. **Backup Strategy**: Regular configuration backups

## 📞 Support

If you encounter issues:
1. Check Sliplane documentation: https://docs.sliplane.io/
2. Review CoTURN documentation: https://github.com/coturn/coturn
3. Test TURN connectivity with online tools
4. Monitor Sliplane service logs and metrics

---

**Note**: This configuration is optimized for Sliplane's container platform. For other platforms, you may need to adjust networking and port configurations.