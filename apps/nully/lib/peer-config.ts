import type { PeerJSOption } from "peerjs";
import { getComprehensiveIceServers, getCustomTurnInfo } from "./custom-turn-config";

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
}

// Default PeerJS configuration
const DEFAULT_PEER_CONFIG: PeerJSOption = {
  debug: process.env.NODE_ENV === 'development' ? 1 : 0,
  config: {
    iceServers: getComprehensiveIceServers(),
    iceCandidatePoolSize: 10,
  },
};

// Custom server configuration (from environment)
function getCustomServerConfig(): PeerServerConfig {
  return {
    host: process.env.NEXT_PUBLIC_PEERJS_SERVER_HOST || 'null-peer-server.sliplane.app',
    port: parseInt(process.env.NEXT_PUBLIC_PEERJS_SERVER_PORT || '443'),
    path: process.env.NEXT_PUBLIC_PEERJS_SERVER_PATH || '/',
    secure: process.env.NEXT_PUBLIC_PEERJS_SERVER_SECURE === 'true',
  };
}

/**
 * Get PeerJS configuration based on environment settings
 */
export function getPeerConfig(options: PeerConfigOptions = {}): PeerJSOption {
  const useCustomServer = 
    options.useCustomServer ?? 
    process.env.NEXT_PUBLIC_PEERJS_USE_CUSTOM_SERVER === 'true';
  
  const baseConfig: PeerJSOption = {
    ...DEFAULT_PEER_CONFIG,
    ...options,
    config: {
      ...DEFAULT_PEER_CONFIG.config,
      iceServers: getComprehensiveIceServers(),
      ...options.config,
    }
  };

  if (useCustomServer) {
    const serverConfig = options.serverConfig ?? getCustomServerConfig();
    
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
 */
export function getServerInfo(): string {
  const useCustomServer = process.env.NEXT_PUBLIC_PEERJS_USE_CUSTOM_SERVER === 'true';
  const customTurnInfo = getCustomTurnInfo();
  
  const serverInfo = useCustomServer ? 'Custom PeerJS Server' : 'Default PeerJS Server';
  const turnInfo = customTurnInfo ? ` | ${customTurnInfo}` : '';
  
  return `${serverInfo}${turnInfo}`;
}


