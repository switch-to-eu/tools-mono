/**
 * Custom TURN Server Configuration for Nully
 * Supports self-hosted CoTURN servers (e.g., on Sliplane)
 */

export interface CustomTurnConfig {
  server: string;
  port: number;
  username: string;
  password: string;
  realm?: string;
  protocols?: ('udp' | 'tcp' | 'tls')[];
  alternativePorts?: number[];
}

/**
 * Get custom TURN server configuration from environment variables
 */
export function getCustomTurnConfig(): CustomTurnConfig | null {
  const server = process.env.NEXT_PUBLIC_CUSTOM_TURN_SERVER;
  const username = process.env.NEXT_PUBLIC_CUSTOM_TURN_USERNAME;
  const password = process.env.NEXT_PUBLIC_CUSTOM_TURN_PASSWORD;
  const useCustom = process.env.NEXT_PUBLIC_USE_CUSTOM_TURN === 'true';
  
  if (!useCustom || !server || !username || !password) {
    return null;
  }
  
  const port = parseInt(process.env.NEXT_PUBLIC_CUSTOM_TURN_PORT || '3478');
  const realm = process.env.NEXT_PUBLIC_CUSTOM_TURN_REALM || 'nully.app';
  const protocols = (process.env.NEXT_PUBLIC_CUSTOM_TURN_PROTOCOLS || 'udp,tcp,tls').split(',') as ('udp' | 'tcp' | 'tls')[];
  const alternativePorts = (process.env.NEXT_PUBLIC_CUSTOM_TURN_ALT_PORTS || '80,443,5349')
    .split(',')
    .map(p => parseInt(p.trim()))
    .filter(p => !isNaN(p));
  
  return {
    server,
    port,
    username,
    password,
    realm,
    protocols,
    alternativePorts
  };
}

/**
 * Generate RTCIceServer configurations from custom TURN config
 */
export function generateCustomTurnServers(config: CustomTurnConfig): RTCIceServer[] {
  const servers: RTCIceServer[] = [];
  const { server, port, username, password, protocols = ['udp', 'tcp', 'tls'], alternativePorts = [] } = config;
  
  // Generate servers for each protocol on main port (focus on working TCP)
  protocols.forEach(protocol => {
    let urls: string;
    
    switch (protocol) {
      case 'udp':
        // Skip UDP for now - Sliplane platform limitations
        console.log('[Custom TURN] Skipping UDP endpoint - platform routing limitations');
        return;
      case 'tcp':
        urls = `turn:${server}:${port}?transport=tcp`;
        break;
      case 'tls':
        // Skip TLS - no certificates configured
        console.log('[Custom TURN] Skipping TLS endpoint - no certificates configured');
        return;
    }
    
    servers.push({ urls, username, credential: password });
  });
  
  // Generate servers for alternative ports (TCP only, skip problematic ports)
  alternativePorts.forEach(altPort => {
    if (altPort === 443 || altPort === 5349) {
      // Skip TLS ports - no certificates
      console.log(`[Custom TURN] Skipping TLS port ${altPort} - no certificates configured`);
      return;
    } else if (altPort === 80) {
      // Skip port 80 - conflicts with Sliplane HTTP routing
      console.log(`[Custom TURN] Skipping port 80 - conflicts with Sliplane HTTP routing`);
      return;
    } else {
      // Regular TURN TCP on alternative ports
      servers.push({
        urls: `turn:${server}:${altPort}?transport=tcp`,
        username,
        credential: password
      });
    }
  });
  
  return servers;
}

/**
 * Get comprehensive ICE servers including custom TURN
 */
export function getComprehensiveIceServers(): RTCIceServer[] {
  const servers: RTCIceServer[] = [];
  
  // Always include Google STUN servers
  servers.push(
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' }
  );
  
  // Add custom TURN server if configured
  const customConfig = getCustomTurnConfig();
  if (customConfig) {
    console.log('[Custom TURN] Using custom TURN server:', customConfig.server);
    const customServers = generateCustomTurnServers(customConfig);
    servers.push(...customServers);
    
    console.log('[Custom TURN] Generated TURN servers:', customServers.length);
    customServers.forEach((server, idx) => {
      console.log(`[Custom TURN] ${idx + 1}. ${server.urls}`);
    });
  } else {
    console.log('[Custom TURN] No custom TURN server configured, using fallback servers');
    
    // Fallback to reliable public servers
    servers.push(
      {
        urls: 'turn:a.relay.metered.ca:80',
        username: 'e46b04279917ad3e74ce808e',
        credential: 'nVQbPOmeQMmQHy9j'
      },
      {
        urls: 'turn:a.relay.metered.ca:443?transport=tcp',
        username: 'e46b04279917ad3e74ce808e',
        credential: 'nVQbPOmeQMmQHy9j'
      }
    );
  }
  
  return servers;
}

/**
 * Test custom TURN server connectivity
 */
export async function testCustomTurnServer(): Promise<{
  success: boolean;
  error?: string;
  details: {
    server: string;
    reachable: boolean;
    relayFound: boolean;
    duration: number;
  };
}> {
  const config = getCustomTurnConfig();
  
  if (!config) {
    return {
      success: false,
      error: 'No custom TURN server configured',
      details: {
        server: 'none',
        reachable: false,
        relayFound: false,
        duration: 0
      }
    };
  }
  
  const startTime = Date.now();
  
  try {
    const servers = generateCustomTurnServers(config);
    if (servers.length === 0) {
      return {
        success: false,
        error: 'No TURN servers configured',
        details: {
          server: config.server,
          reachable: false,
          relayFound: false,
          duration: Date.now() - startTime
        }
      };
    }
    const testServer = servers[0]; // Test first server configuration
    
    const pc = new RTCPeerConnection({
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        testServer
      ]
    });
    
    pc.createDataChannel('test');
    
    return new Promise((resolve) => {
      let relayFound = false;
      const timeout = setTimeout(() => {
        pc.close();
        resolve({
          success: false,
          error: 'Timeout - no relay candidates found',
          details: {
            server: config.server,
            reachable: true,
            relayFound: false,
            duration: Date.now() - startTime
          }
        });
      }, 10000);
      
      pc.onicecandidate = (event) => {
        if (event.candidate && event.candidate.type === 'relay') {
          relayFound = true;
          clearTimeout(timeout);
          pc.close();
          resolve({
            success: true,
            details: {
              server: config.server,
              reachable: true,
              relayFound: true,
              duration: Date.now() - startTime
            }
          });
        }
      };
      
      pc.onicegatheringstatechange = () => {
        if (pc.iceGatheringState === 'complete' && !relayFound) {
          clearTimeout(timeout);
          pc.close();
          resolve({
            success: false,
            error: 'ICE gathering completed but no relay candidates found',
            details: {
              server: config.server,
              reachable: true,
              relayFound: false,
              duration: Date.now() - startTime
            }
          });
        }
      };
      
      pc.createOffer().then(offer => pc.setLocalDescription(offer));
    });
    
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      details: {
        server: config.server,
        reachable: false,
        relayFound: false,
        duration: Date.now() - startTime
      }
    };
  }
}

/**
 * Get custom TURN server info for display
 */
export function getCustomTurnInfo(): string | null {
  const config = getCustomTurnConfig();
  
  if (!config) {
    return null;
  }
  
  const servers = generateCustomTurnServers(config);
  return `Custom TURN: ${config.server} (${servers.length} endpoints configured)`;
}