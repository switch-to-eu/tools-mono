import type { PeerJSOption } from "peerjs";
import { getAdaptiveIceServers, getWorkingTurnServers } from "./peer-fallback-config";

/**
 * PeerJS Server Configuration
 * 
 * This module provides centralized configuration for PeerJS server settings.
 * Supports both default PeerJS server and custom server configurations.
 */

export interface PeerServerConfig {
  host: string;
  port: number;
  path: string;
  secure: boolean;
}

export interface PeerConfigOptions extends Partial<PeerJSOption> {
  useCustomServer?: boolean;
  serverConfig?: PeerServerConfig;
  iceStrategy?: 'aggressive' | 'balanced' | 'minimal' | 'adaptive';
}

// Default PeerJS server configuration (fallback)
const DEFAULT_PEER_CONFIG: PeerJSOption = {
  debug: process.env.NODE_ENV === 'development' ? 3 : 1, // Increased debug level
  config: {
    iceServers: getAdaptiveIceServers('balanced'), // Use adaptive strategy
    iceCandidatePoolSize: 10,
    // Enhanced WebRTC configuration
    iceTransportPolicy: 'all', // Allow both STUN and TURN
    bundlePolicy: 'balanced',
    rtcpMuxPolicy: 'require',
    sdpSemantics: 'unified-plan', // Modern SDP format
  },
};

// Custom server configuration
const CUSTOM_SERVER_CONFIG: PeerServerConfig = {
  host: 'null-peer-server.sliplane.app',
  port: 443,
  path: '/',
  secure: true,
};

/**
 * Get PeerJS configuration based on environment settings
 * @param options Override options for configuration
 * @returns PeerJS configuration object or Promise if using adaptive strategy
 */
export function getPeerConfig(options: PeerConfigOptions = {}): PeerJSOption | Promise<PeerJSOption> {
  // Check environment variable for custom server usage
  const useCustomServer = 
    options.useCustomServer ?? 
    process.env.NEXT_PUBLIC_PEERJS_USE_CUSTOM_SERVER === 'true';
  
  const iceStrategy = options.iceStrategy ?? 'balanced';
  
  // If adaptive strategy, return a promise
  if (iceStrategy === 'adaptive') {
    return getAdaptivePeerConfig(options, useCustomServer);
  }
  
  const baseConfig: PeerJSOption = {
    ...DEFAULT_PEER_CONFIG,
    ...options,
    config: {
      ...DEFAULT_PEER_CONFIG.config,
      iceServers: getAdaptiveIceServers(iceStrategy as 'aggressive' | 'balanced' | 'minimal'),
      ...options.config,
    }
  };

  if (useCustomServer) {
    const serverConfig = options.serverConfig ?? CUSTOM_SERVER_CONFIG;
    
    return {
      ...baseConfig,
      host: serverConfig.host,
      port: serverConfig.port,
      path: serverConfig.path,
      secure: serverConfig.secure,
      config: baseConfig.config,
    };
  }

  return baseConfig;
}

/**
 * Get adaptive peer configuration with working TURN servers
 */
async function getAdaptivePeerConfig(options: PeerConfigOptions, useCustomServer: boolean): Promise<PeerJSOption> {
  const workingServers = await getWorkingTurnServers();
  
  const baseConfig: PeerJSOption = {
    ...DEFAULT_PEER_CONFIG,
    ...options,
    config: {
      ...DEFAULT_PEER_CONFIG.config,
      iceServers: workingServers,
      ...options.config,
    }
  };
  
  if (useCustomServer) {
    const serverConfig = options.serverConfig ?? CUSTOM_SERVER_CONFIG;
    
    return {
      ...baseConfig,
      host: serverConfig.host,
      port: serverConfig.port,
      path: serverConfig.path,
      secure: serverConfig.secure,
      config: baseConfig.config,
    };
  }
  
  return baseConfig;
}

/**
 * Get current server configuration info for debugging
 * @returns Human-readable server configuration description
 */
export function getServerInfo(): string {
  const useCustomServer = process.env.NEXT_PUBLIC_PEERJS_USE_CUSTOM_SERVER === 'true';
  const config = getPeerConfig();
  const iceServers = config.config?.iceServers || [];
  const stunCount = iceServers.filter((server: any) => server.urls?.startsWith('stun:')).length;
  const turnCount = iceServers.filter((server: any) => server.urls?.startsWith('turn')).length;
  
  if (useCustomServer) {
    return `Custom Server: ${CUSTOM_SERVER_CONFIG.secure ? 'https' : 'http'}://${CUSTOM_SERVER_CONFIG.host}:${CUSTOM_SERVER_CONFIG.port}${CUSTOM_SERVER_CONFIG.path} (${stunCount} STUN, ${turnCount} TURN servers)`;
  }
  
  return `Default PeerJS Server (0.peerjs.com) (${stunCount} STUN, ${turnCount} TURN servers)`;
}

/**
 * Get detailed ICE server configuration for debugging
 * @returns ICE servers configuration
 */
export function getIceServerInfo(): string[] {
  const config = getPeerConfig();
  return config.config?.iceServers?.map((server: any) => server.urls) || [];
}

/**
 * Test TURN server connectivity
 * @returns Promise that resolves with connectivity test results
 */
export async function testTurnServerConnectivity(): Promise<{ server: string; reachable: boolean; error?: string }[]> {
  const config = getPeerConfig();
  const turnServers = config.config?.iceServers?.filter((server: any) => 
    server.urls?.startsWith('turn')
  ) || [];
  
  const results = [];
  
  for (const server of turnServers) {
    try {
      // Create a test RTCPeerConnection with only this TURN server
      const pc = new RTCPeerConnection({
        iceServers: [server],
        iceCandidatePoolSize: 1
      });
      
      // Create a data channel to trigger ICE gathering
      pc.createDataChannel('test');
      
      const result = await new Promise<{ server: string; reachable: boolean; error?: string }>((resolve) => {
        let foundRelay = false;
        const timeout = setTimeout(() => {
          pc.close();
          resolve({
            server: (server as any).urls,
            reachable: false,
            error: 'Timeout - no relay candidates found'
          });
        }, 10000);
        
        pc.onicecandidate = (event) => {
          if (event.candidate) {
            console.log(`[TURN Test] Candidate for ${(server as any).urls}:`, event.candidate.type);
            if (event.candidate.type === 'relay') {
              foundRelay = true;
              clearTimeout(timeout);
              pc.close();
              resolve({
                server: (server as any).urls,
                reachable: true
              });
            }
          }
        };
        
        pc.onicegatheringstatechange = () => {
          if (pc.iceGatheringState === 'complete') {
            clearTimeout(timeout);
            pc.close();
            resolve({
              server: (server as any).urls,
              reachable: foundRelay,
              error: foundRelay ? undefined : 'No relay candidates generated'
            });
          }
        };
        
        // Create offer to start ICE gathering
        pc.createOffer().then(offer => pc.setLocalDescription(offer));
      });
      
      results.push(result);
    } catch (error) {
      results.push({
        server: (server as any).urls,
        reachable: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
  
  return results;
}

/**
 * Log TURN server connectivity results
 */
export function logTurnConnectivity() {
  console.log('[TURN Test] Starting TURN server connectivity test...');
  testTurnServerConnectivity().then(results => {
    console.log('[TURN Test] 🧪 TURN Server Connectivity Results:');
    results.forEach(result => {
      if (result.reachable) {
        console.log(`[TURN Test] ✅ ${result.server} - REACHABLE`);
      } else {
        console.error(`[TURN Test] ❌ ${result.server} - FAILED: ${result.error}`);
      }
    });
    
    const workingServers = results.filter(r => r.reachable).length;
    const totalServers = results.length;
    console.log(`[TURN Test] 📊 Summary: ${workingServers}/${totalServers} TURN servers are reachable`);
    
    if (workingServers === 0) {
      console.error('[TURN Test] 🚨 CRITICAL: No TURN servers are reachable! WebRTC connections will likely fail behind NAT/firewall.');
    }
  }).catch(error => {
    console.error('[TURN Test] Failed to test TURN connectivity:', error);
  });
}

// Export server configuration for testing and monitoring
export { CUSTOM_SERVER_CONFIG, DEFAULT_PEER_CONFIG };