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
 * Get custom TURN server configuration only
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