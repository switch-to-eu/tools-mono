/**
 * Custom TURN Server Configuration for Nully
 */

export interface CustomTurnConfig {
  server: string;
  username: string;
  password: string;
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
  
  return { server, username, password };
}

/**
 * Generate RTCIceServer configurations from custom TURN config
 */
export function generateCustomTurnServers(config: CustomTurnConfig): RTCIceServer[] {
  const { server, username, password } = config;
  
  // Only use TCP on port 3478 (the only configuration that works reliably)
  return [{
    urls: `turn:${server}:3478?transport=tcp`,
    username,
    credential: password
  }];
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
    
    // Return early - don't add any fallback servers when custom TURN is configured
    return servers;
  } else {
    
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
 * Get custom TURN server info for display
 */
export function getCustomTurnInfo(): string | null {
  const config = getCustomTurnConfig();
  return config ? `Custom TURN: ${config.server}` : null;
}