/**
 * @vitest-environment jsdom
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { CryptoService } from '@/lib/crypto';

// Mock the Web Crypto API for testing
global.crypto = {
  getRandomValues: (arr: any) => {
    for (let i = 0; i < arr.length; i++) {
      arr[i] = Math.floor(Math.random() * 256);
    }
    return arr;
  },
  subtle: {
    importKey: async () => ({ type: 'secret' }),
    deriveKey: async () => ({ type: 'secret', algorithm: { name: 'AES-GCM' } }),
    encrypt: async (algorithm: any, key: any, data: any) => {
      return new ArrayBuffer(data.byteLength + 16); // Mock encrypted data with auth tag
    },
    decrypt: async (algorithm: any, key: any, data: any) => {
      return data.slice(0, data.byteLength - 16); // Mock decrypted data
    }
  }
} as any;

// Mock TextEncoder/TextDecoder
global.TextEncoder = class {
  encode(input: string) {
    return new Uint8Array(Array.from(input).map(c => c.charCodeAt(0)));
  }
};

global.TextDecoder = class {
  decode(input: BufferSource) {
    return String.fromCharCode(...new Uint8Array(input as ArrayBuffer));
  }
};

// Mock btoa/atob for base64 encoding
global.btoa = (str: string) => Buffer.from(str, 'binary').toString('base64');
global.atob = (str: string) => Buffer.from(str, 'base64').toString('binary');

describe('CryptoService', () => {
  beforeEach(() => {
    // Reset any global state
    Object.defineProperty(window, 'location', {
      value: { hash: '' },
      writable: true,
    });
  });

  describe('generateBoardId', () => {
    it('should generate a unique board ID', async () => {
      const id1 = await CryptoService.generateBoardId();
      const id2 = await CryptoService.generateBoardId();
      
      expect(id1).toBeDefined();
      expect(id2).toBeDefined();
      expect(id1).not.toBe(id2);
      expect(id1).toMatch(/^[a-z0-9]{12}$/);
    });
  });

  describe('generateEncryptionKey', () => {
    it('should generate a base64 encoded key', async () => {
      const key = await CryptoService.generateEncryptionKey();
      
      expect(key).toBeDefined();
      expect(typeof key).toBe('string');
      // Should be base64 encoded (44 characters for 32 bytes)
      expect(key.length).toBeGreaterThanOrEqual(40);
    });
  });

  describe('encrypt and decrypt', () => {
    it('should encrypt and decrypt data correctly', async () => {
      const originalData = 'Test board data';
      const encryptionKey = await CryptoService.generateEncryptionKey();
      
      const encrypted = await CryptoService.encrypt(originalData, encryptionKey);
      
      expect(encrypted.salt).toBeDefined();
      expect(encrypted.iv).toBeDefined();
      expect(encrypted.ciphertext).toBeDefined();
      
      const decrypted = await CryptoService.decrypt(encrypted, encryptionKey);
      expect(decrypted).toBe(originalData);
    });

    it('should produce different ciphertext for same data', async () => {
      const data = 'Test data';
      const key = await CryptoService.generateEncryptionKey();
      
      const encrypted1 = await CryptoService.encrypt(data, key);
      const encrypted2 = await CryptoService.encrypt(data, key);
      
      // Different salt/iv should produce different ciphertext
      expect(encrypted1.ciphertext).not.toBe(encrypted2.ciphertext);
      expect(encrypted1.salt).not.toBe(encrypted2.salt);
      expect(encrypted1.iv).not.toBe(encrypted2.iv);
    });
  });

  describe('generateShareLink', () => {
    it('should generate a valid share link', () => {
      const boardId = 'test123';
      const encryptionKey = 'testkey';
      
      Object.defineProperty(window, 'location', {
        value: { origin: 'https://example.com' },
        writable: true,
      });
      
      const link = CryptoService.generateShareLink(boardId, encryptionKey);
      
      expect(link).toBe('https://example.com/board/test123#testkey');
    });
  });

  describe('extractKeyFromUrl', () => {
    it('should extract key from URL hash', () => {
      Object.defineProperty(window, 'location', {
        value: { hash: '#testkey123' },
        writable: true,
      });
      
      const key = CryptoService.extractKeyFromUrl();
      expect(key).toBe('testkey123');
    });

    it('should return null for empty hash', () => {
      Object.defineProperty(window, 'location', {
        value: { hash: '' },
        writable: true,
      });
      
      const key = CryptoService.extractKeyFromUrl();
      expect(key).toBeNull();
    });

    it('should return null in server environment', () => {
      const originalWindow = global.window;
      // @ts-ignore
      delete global.window;
      
      const key = CryptoService.extractKeyFromUrl();
      expect(key).toBeNull();
      
      global.window = originalWindow;
    });
  });
});