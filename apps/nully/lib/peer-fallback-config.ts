/**
 * Fallback TURN Server Configurations
 * Multiple providers and protocols for maximum compatibility
 */

export const TURN_SERVER_CONFIGS = {
  // Primary: Metered TURN (different region)
  metered_primary: [
    {
      urls: 'turn:a.relay.metered.ca:80',
      username: 'e46b04279917ad3e74ce808e',
      credential: 'nVQbPOmeQMmQHy9j'
    },
    {
      urls: 'turn:a.relay.metered.ca:80?transport=tcp',
      username: 'e46b04279917ad3e74ce808e', 
      credential: 'nVQbPOmeQMmQHy9j'
    },
    {
      urls: 'turn:a.relay.metered.ca:443',
      username: 'e46b04279917ad3e74ce808e',
      credential: 'nVQbPOmeQMmQHy9j'
    }
  ],

  // Secondary: Twilio TURN (requires account but very reliable)
  twilio: [
    {
      urls: 'turn:global.turn.twilio.com:3478?transport=udp',
      username: 'f4b4035eaa76f4a55de5f4351567653ee4ff6fa97b50b6b334fcc1be9c27212d',
      credential: 'R0HjgaRsKPg4FTvC5BryUO8c1k8+9em3SwUThZG3Zu0='
    },
    {
      urls: 'turn:global.turn.twilio.com:3478?transport=tcp',
      username: 'f4b4035eaa76f4a55de5f4351567653ee4ff6fa97b50b6b334fcc1be9c27212d',
      credential: 'R0HjgaRsKPg4FTvC5BryUO8c1k8+9em3SwUThZG3Zu0='
    },
    {
      urls: 'turn:global.turn.twilio.com:443?transport=tcp',
      username: 'f4b4035eaa76f4a55de5f4351567653ee4ff6fa97b50b6b334fcc1be9c27212d',
      credential: 'R0HjgaRsKPg4FTvC5BryUO8c1k8+9em3SwUThZG3Zu0='
    }
  ],

  // Tertiary: Xirsys TURN (free tier available)
  xirsys: [
    {
      urls: 'turn:turn.xirsys.com:80?transport=udp',
      username: 'ml0jDtHFEgY4bGh6yVoFklMrOb2M5DAbXU6zpHm7pRUb2x0J8u0fKg0_sNEOJGNDAAAAAGcyPBl3ZWJydGMtbGl2ZQ==',
      credential: '43dffc3e-b6b8-11ef-95bd-0242ac120004'
    },
    {
      urls: 'turn:turn.xirsys.com:3478?transport=udp',
      username: 'ml0jDtHFEgY4bGh6yVoFklMrOb2M5DAbXU6zpHm7pRUb2x0J8u0fKg0_sNEOJGNDAAAAAGcyPBl3ZWJydGMtbGl2ZQ==',
      credential: '43dffc3e-b6b8-11ef-95bd-0242ac120004'
    },
    {
      urls: 'turn:turn.xirsys.com:80?transport=tcp',
      username: 'ml0jDtHFEgY4bGh6yVoFklMrOb2M5DAbXU6zpHm7pRUb2x0J8u0fKg0_sNEOJGNDAAAAAGcyPBl3ZWJydGMtbGl2ZQ==',
      credential: '43dffc3e-b6b8-11ef-95bd-0242ac120004'
    },
    {
      urls: 'turn:turn.xirsys.com:3478?transport=tcp',
      username: 'ml0jDtHFEgY4bGh6yVoFklMrOb2M5DAbXU6zpHm7pRUb2x0J8u0fKg0_sNEOJGNDAAAAAGcyPBl3ZWJydGMtbGl2ZQ==',
      credential: '43dffc3e-b6b8-11ef-95bd-0242ac120004'
    }
  ],

  // Quaternary: Open Relay (different endpoints)
  openrelay: [
    {
      urls: 'turn:openrelay.metered.ca:80',
      username: 'openrelayproject',
      credential: 'openrelayproject'
    },
    {
      urls: 'turn:openrelay.metered.ca:443',
      username: 'openrelayproject',
      credential: 'openrelayproject'
    },
    {
      urls: 'turn:openrelay.metered.ca:443?transport=tcp',
      username: 'openrelayproject',
      credential: 'openrelayproject'
    }
  ],

  // Google STUN servers (most reliable)
  stun: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    { urls: 'stun:stun2.l.google.com:19302' },
    { urls: 'stun:stun3.l.google.com:19302' },
    { urls: 'stun:stun4.l.google.com:19302' }
  ]
};

/**
 * Get ICE servers based on connection strategy
 */
export function getAdaptiveIceServers(strategy: 'aggressive' | 'balanced' | 'minimal' = 'balanced') {
  switch (strategy) {
    case 'aggressive':
      // Try ALL servers for maximum connectivity
      return [
        ...TURN_SERVER_CONFIGS.stun.slice(0, 2),
        ...TURN_SERVER_CONFIGS.twilio,
        ...TURN_SERVER_CONFIGS.xirsys,
        ...TURN_SERVER_CONFIGS.metered_primary,
        ...TURN_SERVER_CONFIGS.openrelay
      ];
    
    case 'balanced':
      // Default: Mix of reliable servers
      return [
        ...TURN_SERVER_CONFIGS.stun.slice(0, 2),
        ...TURN_SERVER_CONFIGS.twilio.slice(0, 2),
        ...TURN_SERVER_CONFIGS.xirsys.slice(0, 2),
        ...TURN_SERVER_CONFIGS.metered_primary.slice(0, 1)
      ];
    
    case 'minimal':
      // Minimal set for faster connection
      return [
        TURN_SERVER_CONFIGS.stun[0],
        TURN_SERVER_CONFIGS.twilio[2], // TCP on 443 most likely to work
        TURN_SERVER_CONFIGS.xirsys[3]   // TCP on 3478
      ];
    
    default:
      return getAdaptiveIceServers('balanced');
  }
}

/**
 * Test connectivity and return working servers
 */
export async function getWorkingTurnServers(): Promise<RTCIceServer[]> {
  const allServers = getAdaptiveIceServers('aggressive');
  const workingServers: RTCIceServer[] = [];
  
  // Always include STUN servers
  workingServers.push(...TURN_SERVER_CONFIGS.stun.slice(0, 2));
  
  // Test TURN servers in parallel
  const testPromises = allServers
    .filter(server => server && server.urls?.toString().startsWith('turn'))
    .map(async (server) => {
      if (!server) return null;
      
      try {
        const pc = new RTCPeerConnection({
          iceServers: [server],
          iceCandidatePoolSize: 1
        });
        
        pc.createDataChannel('test');
        
        return new Promise<RTCIceServer | null>((resolve) => {
          let foundRelay = false;
          const timeout = setTimeout(() => {
            pc.close();
            resolve(null);
          }, 5000); // 5 second timeout
          
          pc.onicecandidate = (event) => {
            if (event.candidate && event.candidate.type === 'relay') {
              foundRelay = true;
              clearTimeout(timeout);
              pc.close();
              console.log(`[TURN Test] ✅ Working: ${server?.urls}`);
              resolve(server);
            }
          };
          
          pc.onicegatheringstatechange = () => {
            if (pc.iceGatheringState === 'complete' && !foundRelay) {
              clearTimeout(timeout);
              pc.close();
              resolve(null);
            }
          };
          
          pc.createOffer().then(offer => pc.setLocalDescription(offer));
        });
      } catch (error) {
        console.error(`[TURN Test] Failed to test ${server?.urls}:`, error);
        return null;
      }
    });
  
  const results = await Promise.all(testPromises);
  const validServers = results.filter((s): s is RTCIceServer => s !== null);
  
  if (validServers.length > 0) {
    workingServers.push(...validServers.slice(0, 3)); // Add up to 3 working TURN servers
    console.log(`[TURN Test] Found ${validServers.length} working TURN servers`);
  } else {
    console.error('[TURN Test] ⚠️ No working TURN servers found, using fallback configuration');
    // Use TCP servers on port 443 as they're most likely to work through firewalls
    const twilioServer = TURN_SERVER_CONFIGS.twilio[2];
    const xirsysServer = TURN_SERVER_CONFIGS.xirsys[3];
    
    if (twilioServer) workingServers.push(twilioServer);
    if (xirsysServer) workingServers.push(xirsysServer);
  }
  
  return workingServers;
}

/**
 * Connection diagnostic information
 */
export async function diagnoseConnectivity(): Promise<{
  hasInternet: boolean;
  stunReachable: boolean;
  turnReachable: boolean;
  behindNAT: boolean;
  recommendation: string;
}> {
  let hasInternet = false;
  let stunReachable = false;
  let turnReachable = false;
  let behindNAT = false;
  
  // Test internet connectivity
  try {
    await fetch('https://www.google.com/favicon.ico', { mode: 'no-cors' });
    hasInternet = true;
  } catch {
    hasInternet = false;
  }
  
  // Test STUN
  try {
    const pc = new RTCPeerConnection({
      iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
    });
    pc.createDataChannel('test');
    await pc.createOffer().then(offer => pc.setLocalDescription(offer));
    
    await new Promise((resolve) => {
      setTimeout(() => {
        pc.getStats().then(stats => {
          stats.forEach(stat => {
            if (stat.type === 'local-candidate' && stat.candidateType === 'srflx') {
              stunReachable = true;
              behindNAT = true;
            }
          });
          resolve(null);
        });
      }, 2000);
    });
    pc.close();
  } catch {
    stunReachable = false;
  }
  
  // Test TURN
  const workingServers = await getWorkingTurnServers();
  turnReachable = workingServers.some(s => s.urls?.toString().startsWith('turn'));
  
  // Generate recommendation
  let recommendation = '';
  if (!hasInternet) {
    recommendation = 'No internet connection detected. Check network connection.';
  } else if (!stunReachable) {
    recommendation = 'STUN servers unreachable. Firewall may be blocking WebRTC.';
  } else if (!turnReachable && behindNAT) {
    recommendation = 'Behind NAT but no TURN servers working. Try using a VPN or different network.';
  } else if (turnReachable) {
    recommendation = 'Network configuration looks good. Connections should work.';
  } else {
    recommendation = 'Direct peer-to-peer should work without TURN servers.';
  }
  
  return {
    hasInternet,
    stunReachable,
    turnReachable,
    behindNAT,
    recommendation
  };
}