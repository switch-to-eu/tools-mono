/**
 * Comprehensive TURN Server Testing Script
 * Tests each TURN server individually and provides detailed reports
 */

export interface TurnServerTest {
  name: string;
  server: RTCIceServer;
  result: 'success' | 'failed' | 'timeout' | 'error';
  duration: number;
  relayCandidate?: RTCIceCandidate;
  error?: string;
  details: {
    localCandidates: number;
    relayCandidates: number;
    srflxCandidates: number;
    hostCandidates: number;
    iceGatheringState: RTCIceGatheringState;
    iceConnectionState?: RTCIceConnectionState;
  };
}

export interface TurnTestReport {
  timestamp: string;
  totalServers: number;
  successfulServers: number;
  failedServers: number;
  overallResult: 'all-working' | 'some-working' | 'none-working';
  recommendations: string[];
  testResults: TurnServerTest[];
  networkInfo: {
    userAgent: string;
    language: string;
    platform: string;
    onLine: boolean;
  };
}

import { getCustomTurnConfig, generateCustomTurnServers } from './custom-turn-config';

// Extended TURN server configurations for testing
function getTurnTestServers(): Array<{name: string; server: RTCIceServer}> {
  const servers: Array<{name: string; server: RTCIceServer}> = [];
  
  // If custom TURN server is configured, only test that one
  const customConfig = getCustomTurnConfig();
  if (customConfig) {
    console.log('[TURN Test] 🎯 Custom TURN server found - testing only custom server');
    const customServers = generateCustomTurnServers(customConfig);
    customServers.forEach((server, idx) => {
      servers.push({
        name: `Custom TURN ${idx + 1}: ${server.urls}`,
        server
      });
    });
    return servers; // Return early - only test custom servers
  }
  
  console.log('[TURN Test] No custom TURN server - testing all public servers');
  
  // Add public TURN servers (only if no custom server)
  servers.push(
  // Metered TURN servers
  {
    name: "Metered TURN UDP:80",
    server: {
      urls: 'turn:a.relay.metered.ca:80',
      username: 'e46b04279917ad3e74ce808e',
      credential: 'nVQbPOmeQMmQHy9j'
    }
  },
  {
    name: "Metered TURN TCP:80", 
    server: {
      urls: 'turn:a.relay.metered.ca:80?transport=tcp',
      username: 'e46b04279917ad3e74ce808e',
      credential: 'nVQbPOmeQMmQHy9j'
    }
  },
  {
    name: "Metered TURN UDP:443",
    server: {
      urls: 'turn:a.relay.metered.ca:443',
      username: 'e46b04279917ad3e74ce808e', 
      credential: 'nVQbPOmeQMmQHy9j'
    }
  },
  {
    name: "Metered TURNS TCP:443",
    server: {
      urls: 'turns:a.relay.metered.ca:443?transport=tcp',
      username: 'e46b04279917ad3e74ce808e',
      credential: 'nVQbPOmeQMmQHy9j'
    }
  },
  
  // Twilio TURN servers  
  {
    name: "Twilio TURN UDP:3478",
    server: {
      urls: 'turn:global.turn.twilio.com:3478?transport=udp',
      username: 'f4b4035eaa76f4a55de5f4351567653ee4ff6fa97b50b6b334fcc1be9c27212d',
      credential: 'R0HjgaRsKPg4FTvC5BryUO8c1k8+9em3SwUThZG3Zu0='
    }
  },
  {
    name: "Twilio TURN TCP:3478",
    server: {
      urls: 'turn:global.turn.twilio.com:3478?transport=tcp',
      username: 'f4b4035eaa76f4a55de5f4351567653ee4ff6fa97b50b6b334fcc1be9c27212d',
      credential: 'R0HjgaRsKPg4FTvC5BryUO8c1k8+9em3SwUThZG3Zu0='
    }
  },
  {
    name: "Twilio TURN TCP:443",
    server: {
      urls: 'turn:global.turn.twilio.com:443?transport=tcp',
      username: 'f4b4035eaa76f4a55de5f4351567653ee4ff6fa97b50b6b334fcc1be9c27212d', 
      credential: 'R0HjgaRsKPg4FTvC5BryUO8c1k8+9em3SwUThZG3Zu0='
    }
  },
  
  // Xirsys TURN servers
  {
    name: "Xirsys TURN UDP:80",
    server: {
      urls: 'turn:turn.xirsys.com:80?transport=udp',
      username: 'ml0jDtHFEgY4bGh6yVoFklMrOb2M5DAbXU6zpHm7pRUb2x0J8u0fKg0_sNEOJGNDAAAAAGcyPBl3ZWJydGMtbGl2ZQ==',
      credential: '43dffc3e-b6b8-11ef-95bd-0242ac120004'
    }
  },
  {
    name: "Xirsys TURN UDP:3478",
    server: {
      urls: 'turn:turn.xirsys.com:3478?transport=udp',
      username: 'ml0jDtHFEgY4bGh6yVoFklMrOb2M5DAbXU6zpHm7pRUb2x0J8u0fKg0_sNEOJGNDAAAAAGcyPBl3ZWJydGMtbGl2ZQ==',
      credential: '43dffc3e-b6b8-11ef-95bd-0242ac120004'
    }
  },
  {
    name: "Xirsys TURN TCP:80",
    server: {
      urls: 'turn:turn.xirsys.com:80?transport=tcp',
      username: 'ml0jDtHFEgY4bGh6yVoFklMrOb2M5DAbXU6zpHm7pRUb2x0J8u0fKg0_sNEOJGNDAAAAAGcyPBl3ZWJydGMtbGl2ZQ==',
      credential: '43dffc3e-b6b8-11ef-95bd-0242ac120004'
    }
  },
  {
    name: "Xirsys TURN TCP:3478",
    server: {
      urls: 'turn:turn.xirsys.com:3478?transport=tcp',
      username: 'ml0jDtHFEgY4bGh6yVoFklMrOb2M5DAbXU6zpHm7pRUb2x0J8u0fKg0_sNEOJGNDAAAAAGcyPBl3ZWJydGMtbGl2ZQ==',
      credential: '43dffc3e-b6b8-11ef-95bd-0242ac120004'
    }
  },
  
  // OpenRelay TURN servers
  {
    name: "OpenRelay TURN UDP:80",
    server: {
      urls: 'turn:openrelay.metered.ca:80',
      username: 'openrelayproject',
      credential: 'openrelayproject'
    }
  },
  {
    name: "OpenRelay TURN UDP:443", 
    server: {
      urls: 'turn:openrelay.metered.ca:443',
      username: 'openrelayproject',
      credential: 'openrelayproject'
    }
  },
  {
    name: "OpenRelay TURNS TCP:443",
    server: {
      urls: 'turns:openrelay.metered.ca:443?transport=tcp',
      username: 'openrelayproject',
      credential: 'openrelayproject'
    }
  },
  
  // Public/Free TURN servers
  {
    name: "Numb Viagenie UDP:3478",
    server: {
      urls: 'turn:numb.viagenie.ca:3478',
      username: 'webrtc@live.com',
      credential: 'muazkh'
    }
  },
  
  // Additional reliable servers
  {
    name: "ExpressTurn UDP:3478",
    server: {
      urls: 'turn:relay1.expressturn.com:3478',
      username: 'efJX3B48EZBZAHK3Y2',
      credential: 'VLDnR2fvqo9tdHoE'
    }
  }
  );
  
  return servers;
}

export const TURN_TEST_SERVERS = getTurnTestServers();

/**
 * Test a single TURN server
 */
async function testSingleTurnServer(
  name: string, 
  server: RTCIceServer, 
  timeout: number = 10000
): Promise<TurnServerTest> {
  const startTime = Date.now();
  
  const result: TurnServerTest = {
    name,
    server,
    result: 'failed',
    duration: 0,
    details: {
      localCandidates: 0,
      relayCandidates: 0,
      srflxCandidates: 0,
      hostCandidates: 0,
      iceGatheringState: 'new'
    }
  };

  try {
    // Create RTCPeerConnection with only this TURN server
    const pc = new RTCPeerConnection({
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' }, // Include STUN for srflx candidates
        server
      ],
      iceCandidatePoolSize: 10
    });

    // Create data channel to trigger ICE gathering
    pc.createDataChannel('test');

    return new Promise((resolve) => {
      let foundRelay = false;
      let timeoutId: NodeJS.Timeout;
      
      const cleanup = () => {
        if (timeoutId) clearTimeout(timeoutId);
        pc.close();
        result.duration = Date.now() - startTime;
      };

      // Set timeout
      timeoutId = setTimeout(() => {
        result.result = 'timeout';
        result.details.iceGatheringState = pc.iceGatheringState;
        cleanup();
        resolve(result);
      }, timeout);

      pc.onicecandidate = (event) => {
        if (event.candidate) {
          const candidate = event.candidate;
          result.details.localCandidates++;
          
          // Categorize candidates
          switch (candidate.type) {
            case 'relay':
              result.details.relayCandidates++;
              result.relayCandidate = candidate;
              foundRelay = true;
              break;
            case 'srflx':
              result.details.srflxCandidates++;
              break;
            case 'host':
              result.details.hostCandidates++;
              break;
          }
          
          console.log(`[TURN Test ${name}] Found ${candidate.type} candidate:`, {
            foundation: candidate.foundation,
            protocol: candidate.protocol,
            address: candidate.address,
            port: candidate.port
          });
          
          // Success if we found a relay candidate
          if (candidate.type === 'relay') {
            result.result = 'success';
            cleanup();
            resolve(result);
          }
        }
      };

      pc.onicegatheringstatechange = () => {
        result.details.iceGatheringState = pc.iceGatheringState;
        
        if (pc.iceGatheringState === 'complete') {
          if (!foundRelay) {
            result.result = 'failed';
            result.error = 'ICE gathering completed but no relay candidates found';
          }
          cleanup();
          resolve(result);
        }
      };

      pc.oniceconnectionstatechange = () => {
        result.details.iceConnectionState = pc.iceConnectionState;
      };

      // Start ICE gathering
      pc.createOffer()
        .then(offer => pc.setLocalDescription(offer))
        .catch(error => {
          result.result = 'error';
          result.error = error.message;
          cleanup();
          resolve(result);
        });
    });

  } catch (error) {
    result.result = 'error';
    result.error = error instanceof Error ? error.message : 'Unknown error';
    result.duration = Date.now() - startTime;
    return result;
  }
}

/**
 * Test all TURN servers and generate comprehensive report
 */
export async function runComprehensiveTurnTest(
  onProgress?: (current: number, total: number, serverName: string) => void
): Promise<TurnTestReport> {
  const startTime = Date.now();
  const testResults: TurnServerTest[] = [];
  
  // Get fresh server list (includes custom TURN if configured)
  const servers = getTurnTestServers();
  
  console.log('[TURN Test] Starting comprehensive TURN server test...');
  console.log(`[TURN Test] Testing ${servers.length} servers with 10s timeout each`);
  
  const customConfig = getCustomTurnConfig();
  if (customConfig) {
    console.log(`[TURN Test] 🎯 Custom TURN server detected: ${customConfig.server}`);
  } else {
    console.log('[TURN Test] ⚠️ No custom TURN server configured');
  }
  
  // Test each server sequentially (to avoid overwhelming network)
  for (let i = 0; i < servers.length; i++) {
    const { name, server } = servers[i];
    
    if (onProgress) {
      onProgress(i + 1, servers.length, name);
    }
    
    console.log(`[TURN Test] Testing ${i + 1}/${servers.length}: ${name}`);
    
    const testResult = await testSingleTurnServer(name, server);
    testResults.push(testResult);
    
    console.log(`[TURN Test] ${name}: ${testResult.result.toUpperCase()} (${testResult.duration}ms)`);
    
    // Small delay between tests to avoid overwhelming network
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  // Calculate statistics
  const successfulServers = testResults.filter(r => r.result === 'success').length;
  const failedServers = testResults.filter(r => r.result === 'failed').length;
  
  // Determine overall result
  let overallResult: 'all-working' | 'some-working' | 'none-working';
  if (successfulServers === testResults.length) {
    overallResult = 'all-working';
  } else if (successfulServers > 0) {
    overallResult = 'some-working';
  } else {
    overallResult = 'none-working';
  }
  
  // Generate recommendations
  const recommendations = generateRecommendations(testResults, overallResult);
  
  const report: TurnTestReport = {
    timestamp: new Date().toISOString(),
    totalServers: testResults.length,
    successfulServers,
    failedServers,
    overallResult,
    recommendations,
    testResults,
    networkInfo: {
      userAgent: navigator.userAgent,
      language: navigator.language,
      platform: navigator.platform,
      onLine: navigator.onLine
    }
  };
  
  console.log(`[TURN Test] Completed in ${Date.now() - startTime}ms`);
  console.log(`[TURN Test] Results: ${successfulServers}/${testResults.length} servers working`);
  
  return report;
}

/**
 * Generate recommendations based on test results
 */
function generateRecommendations(
  testResults: TurnServerTest[], 
  overallResult: string
): string[] {
  const recommendations: string[] = [];
  const workingServers = testResults.filter(r => r.result === 'success');
  const failedServers = testResults.filter(r => r.result === 'failed');
  const timeoutServers = testResults.filter(r => r.result === 'timeout');
  
  if (overallResult === 'all-working') {
    recommendations.push("✅ Excellent! All TURN servers are working correctly.");
    recommendations.push("🎯 Your network has optimal WebRTC connectivity.");
    recommendations.push("📞 Peer-to-peer connections should work reliably behind NAT/firewalls.");
  } else if (overallResult === 'some-working') {
    recommendations.push(`✅ ${workingServers.length} out of ${testResults.length} TURN servers are working.`);
    recommendations.push("🔧 Use only the working servers for better connection reliability.");
    
    // Analyze working servers for patterns
    const workingTcp = workingServers.filter(s => s.server.urls?.toString().includes('tcp'));
    const workingUdp = workingServers.filter(s => !s.server.urls?.toString().includes('tcp'));
    const working443 = workingServers.filter(s => s.server.urls?.toString().includes('443'));
    
    if (workingTcp.length > workingUdp.length) {
      recommendations.push("🔍 TCP transport works better than UDP - likely UDP is blocked.");
    }
    if (working443.length > 0) {
      recommendations.push("🔒 Port 443 connections work - good for firewall traversal.");
    }
  } else {
    recommendations.push("❌ No TURN servers are working - this is a connectivity issue.");
    recommendations.push("🔥 WebRTC connections will likely fail behind NAT/firewalls.");
    
    if (timeoutServers.length > failedServers.length) {
      recommendations.push("⏰ Many servers are timing out - check network connectivity.");
      recommendations.push("🌐 Try testing from a different network (mobile hotspot).");
    }
    
    recommendations.push("🛡️ Check if corporate firewall is blocking WebRTC/TURN traffic.");
    recommendations.push("🔧 Consider using a VPN or contacting your IT department.");
  }
  
  return recommendations;
}

/**
 * Export test report to downloadable JSON
 */
export function exportTestReport(report: TurnTestReport): void {
  const blob = new Blob([JSON.stringify(report, null, 2)], { 
    type: 'application/json' 
  });
  
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `turn-server-test-${new Date().toISOString().split('T')[0]}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}