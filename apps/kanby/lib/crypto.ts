import { customAlphabet } from 'nanoid';

const generateId = customAlphabet('abcdefghijklmnopqrstuvwxyz0123456789', 12);

export interface EncryptedData {
  salt: string;
  iv: string;
  ciphertext: string;
}

export class CryptoService {
  private static encoder = new TextEncoder();
  private static decoder = new TextDecoder();

  static async generateBoardId(): Promise<string> {
    return generateId();
  }

  static async generateEncryptionKey(): Promise<string> {
    const keyBytes = crypto.getRandomValues(new Uint8Array(32));
    return btoa(String.fromCharCode(...keyBytes));
  }

  static async deriveKey(password: string, salt: Uint8Array): Promise<CryptoKey> {
    const passwordKey = await crypto.subtle.importKey(
      'raw',
      this.encoder.encode(password),
      'PBKDF2',
      false,
      ['deriveKey']
    );

    return crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt,
        iterations: 100000,
        hash: 'SHA-256'
      },
      passwordKey,
      { name: 'AES-GCM', length: 256 },
      false,
      ['encrypt', 'decrypt']
    );
  }

  static async encrypt(data: string, key: string): Promise<EncryptedData> {
    const salt = crypto.getRandomValues(new Uint8Array(16));
    const iv = crypto.getRandomValues(new Uint8Array(12));
    
    const cryptoKey = await this.deriveKey(key, salt);
    
    const encrypted = await crypto.subtle.encrypt(
      {
        name: 'AES-GCM',
        iv
      },
      cryptoKey,
      this.encoder.encode(data)
    );

    return {
      salt: btoa(String.fromCharCode(...salt)),
      iv: btoa(String.fromCharCode(...iv)),
      ciphertext: btoa(String.fromCharCode(...new Uint8Array(encrypted)))
    };
  }

  static async decrypt(encryptedData: EncryptedData, key: string): Promise<string> {
    const salt = new Uint8Array(atob(encryptedData.salt).split('').map(c => c.charCodeAt(0)));
    const iv = new Uint8Array(atob(encryptedData.iv).split('').map(c => c.charCodeAt(0)));
    const ciphertext = new Uint8Array(atob(encryptedData.ciphertext).split('').map(c => c.charCodeAt(0)));
    
    const cryptoKey = await this.deriveKey(key, salt);
    
    const decrypted = await crypto.subtle.decrypt(
      {
        name: 'AES-GCM',
        iv
      },
      cryptoKey,
      ciphertext
    );

    return this.decoder.decode(decrypted);
  }

  static generateShareLink(boardId: string, encryptionKey: string): string {
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
    return `${baseUrl}/board/${boardId}#${encryptionKey}`;
  }

  static extractKeyFromUrl(): string | null {
    if (typeof window === 'undefined') return null;
    const hash = window.location.hash;
    return hash.length > 1 ? hash.slice(1) : null;
  }
}