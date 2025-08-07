# Nully - Complete Technical Documentation

## Table of Contents
1. [Project Overview](#project-overview)
2. [Core Concepts & Terminology](#core-concepts--terminology)
3. [Architecture Overview](#architecture-overview)
4. [Technical Implementation](#technical-implementation)
5. [File Transfer Protocol](#file-transfer-protocol)
6. [Connection Management](#connection-management)
7. [Security & Privacy](#security--privacy)
8. [Development Guide](#development-guide)
9. [Troubleshooting](#troubleshooting)
10. [API Reference](#api-reference)

---

## Project Overview

### What is Nully?
Nully is a **serverless, peer-to-peer (P2P) file transfer application** that enables direct file sharing between web browsers without uploading files to any server. Think of it as a private tunnel between two browsers where files flow directly from sender to receiver.

### Key Features
- **Zero Server Storage**: Files never touch our servers
- **Direct Browser-to-Browser Transfer**: No middleman for your data
- **End-to-End Encrypted**: Automatic encryption via WebRTC
- **No Size Limits**: Transfer files as large as your connection allows
- **No Registration Required**: Anonymous, instant file sharing
- **Real-time Progress Tracking**: See transfer speeds and progress
- **Multiple File Support**: Send multiple files in one session

### Use Cases
- Sharing sensitive documents without cloud storage
- Transferring large files without upload limits
- Quick file sharing between devices on same network
- Privacy-conscious file transfers

---

## Core Concepts & Terminology

### WebRTC (Web Real-Time Communication)
**WebRTC** is a browser technology that enables direct communication between web browsers without going through a server. Think of it like making a phone call - once connected, you talk directly to each other without the phone company listening in.

**Key Components:**
- **MediaStream**: For audio/video (not used in Nully)
- **DataChannel**: For sending any data (files in our case)
- **RTCPeerConnection**: The connection between browsers

### Peer-to-Peer (P2P)
**P2P** means two devices communicate directly with each other, rather than through a central server. In Nully:
- **Peer**: Each browser is a "peer" (either sender or receiver)
- **Direct Connection**: Data flows straight from sender to receiver
- **No Central Storage**: Unlike Dropbox/Google Drive, files aren't stored centrally

### Signaling Server
A **signaling server** is like a matchmaker - it helps two browsers find each other but doesn't participate in the actual file transfer. Think of it as exchanging phone numbers; once you have the number, you call directly.

**What it does:**
- Assigns unique IDs to peers
- Helps peers exchange connection information
- Steps away once connection is established

### ICE (Interactive Connectivity Establishment)
**ICE** is a framework that helps browsers find the best path to connect to each other, even through firewalls and NATs.

#### STUN (Session Traversal Utilities for NAT)
**STUN servers** help browsers discover their public IP address. It's like asking "what's my phone number that others can call?"

**Example:** Your computer has a private IP (192.168.1.100) but needs to know its public IP (86.123.45.67) for others to connect.

#### TURN (Traversal Using Relays around NAT)
**TURN servers** act as a relay when direct connection is impossible. It's like having a friend pass messages between you when you can't talk directly.

**When used:** When both peers are behind strict firewalls that block direct connections.

### NAT (Network Address Translation)
**NAT** is how your router shares one public IP address among multiple devices. It's like an apartment building where everyone shares the same street address but has different apartment numbers.

**Challenge:** NATs can block incoming connections, making P2P difficult.

### DataChannel
A **DataChannel** is the pipe through which data flows between peers. It's:
- **Reliable**: Ensures all data arrives correctly
- **Ordered**: Data arrives in the order sent
- **Encrypted**: Automatically secured with DTLS encryption

---

## Architecture Overview

### High-Level Architecture
```
┌─────────────┐                      ┌─────────────┐
│   SENDER    │                      │  RECEIVER   │
│  Browser    │                      │   Browser   │
└──────┬──────┘                      └──────┬──────┘
       │                                     │
       │         ┌──────────────┐           │
       └────────►│   PeerJS     │◄──────────┘
                 │   Broker      │
                 │  (Signaling)  │
                 └──────────────┘
                         │
                         ▼
                 ┌──────────────┐
                 │  STUN/TURN   │
                 │   Servers    │
                 └──────────────┘

After connection established:
┌─────────────┐                      ┌─────────────┐
│   SENDER    │◄────────────────────►│  RECEIVER   │
│  Browser    │   Direct P2P Link    │   Browser   │
└─────────────┘  (File Transfer)     └─────────────┘
```

### Technology Stack

#### Frontend
- **Next.js 15**: React framework for building the web application
- **React 19**: UI library for building components
- **TypeScript**: Type-safe JavaScript for better code quality
- **Tailwind CSS**: Utility-first CSS framework for styling

#### P2P Communication
- **WebRTC**: Browser API for peer-to-peer communication
- **PeerJS**: Simplifies WebRTC complexity
- **Custom TURN Server**: Self-hosted relay server for restrictive networks

#### State Management
- **React Hooks**: Custom hooks for connection and file transfer logic
- **Local State**: No global state management needed

### Project Structure
```
apps/nully/
├── app/[locale]/          # Next.js app router with i18n
│   ├── page.tsx          # Home page
│   ├── transfer/         # Sender interface
│   │   └── page.tsx
│   └── join/[peerId]/    # Receiver interface
│       └── page.tsx
├── components/           # React components
│   ├── send-page.tsx    # Sender UI
│   ├── receive-page.tsx # Receiver UI
│   └── connection-panel.tsx
├── hooks/               # Custom React hooks
│   ├── use-peer-connection.ts  # WebRTC connection logic
│   └── use-file-transfer.ts    # File handling logic
├── lib/                 # Utilities and configs
│   ├── peer-config.ts   # PeerJS configuration
│   ├── custom-turn-config.ts # ICE server setup
│   └── interfaces.ts    # TypeScript types
└── messages/           # Internationalization
    ├── en.json
    └── nl.json
```

---

## Technical Implementation

### 1. Connection Establishment Flow

#### Step 1: Sender Initialization
```typescript
// When sender visits /transfer page
const peer = new Peer({
  host: 'your-peerjs-server.com',
  port: 443,
  path: '/peerjs',
  config: {
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'turn:your-turn-server.com', 
        username: 'user', 
        credential: 'pass' }
    ]
  }
});

// Peer ID assigned by server
peer.on('open', (id) => {
  // id = "abc123xyz" (unique identifier)
  const shareableLink = `https://nully.app/join/${id}`;
});
```

#### Step 2: Receiver Joins
```typescript
// Receiver visits /join/abc123xyz
const senderPeerId = 'abc123xyz'; // from URL
const receiverPeer = new Peer(/* same config */);

// Initiate connection to sender
const connection = receiverPeer.connect(senderPeerId);
```

#### Step 3: WebRTC Handshake
The handshake process (happens automatically):

1. **Offer Creation** (Receiver → Sender)
   - Receiver creates SDP (Session Description Protocol) offer
   - Contains: supported codecs, network info, security parameters

2. **Answer Creation** (Sender → Receiver)
   - Sender creates SDP answer
   - Agrees on connection parameters

3. **ICE Candidate Exchange**
   - Both peers discover network paths
   - Exchange possible connection routes
   - Test connectivity options

4. **Connection Established**
   - Best path selected (direct, STUN, or TURN)
   - Encrypted DataChannel created
   - Ready for file transfer

### 2. File Handling System

#### File Selection and Staging
```typescript
interface StagedFile {
  id: string;           // Unique identifier
  file: File;          // JavaScript File object
  name: string;        // filename.ext
  size: number;        // Size in bytes
  type: string;        // MIME type (e.g., "image/png")
  status: 'pending' | 'transferring' | 'completed' | 'error';
  progress: number;    // 0-100 percentage
}

// Sender selects files
const handleFileSelect = (event: ChangeEvent<HTMLInputElement>) => {
  const files = Array.from(event.target.files || []);
  const stagedFiles = files.map(file => ({
    id: generateUniqueId(),
    file,
    name: file.name,
    size: file.size,
    type: file.type,
    status: 'pending',
    progress: 0
  }));
};
```

#### Metadata Synchronization
```typescript
// Automatically sent when connection opens
const syncFileMetadata = () => {
  const metadata = stagedFiles.map(f => ({
    id: f.id,
    name: f.name,
    size: f.size,
    type: f.type
  }));
  
  connection.send({
    type: 'FILE_METADATA',
    files: metadata
  });
};
```

---

## File Transfer Protocol

### Message Protocol
All communication uses structured messages:

```typescript
type PeerMessage = 
  // Metadata sync (Sender → Receiver)
  | { 
      type: 'FILE_METADATA';
      files: Array<{
        id: string;
        name: string;
        size: number;
        type: string;
      }>;
    }
  
  // File request (Receiver → Sender)
  | { 
      type: 'FILE_REQUEST';
      fileId: string;
    }
  
  // File chunk (Sender → Receiver)
  | { 
      type: 'FILE_CHUNK';
      fileId: string;
      chunk: ArrayBuffer;    // Binary data
      index: number;         // Chunk number
      total: number;         // Total chunks
    }
  
  // Transfer complete (Sender → Receiver)
  | { 
      type: 'FILE_COMPLETE';
      fileId: string;
    }
  
  // Download notifications (Receiver → Sender)
  | { 
      type: 'DOWNLOAD_START' | 'DOWNLOAD_COMPLETE' | 'DOWNLOAD_ERROR';
      fileId: string;
      error?: string;
    }
```

### Chunking Strategy

Large files are split into smaller chunks to:
- Prevent memory overflow
- Enable progress tracking
- Allow error recovery
- Maintain responsive UI

```typescript
const CHUNK_SIZE = 64 * 1024; // 64KB per chunk

const sendFile = async (file: File, fileId: string) => {
  const totalChunks = Math.ceil(file.size / CHUNK_SIZE);
  
  for (let i = 0; i < totalChunks; i++) {
    // Extract chunk from file
    const start = i * CHUNK_SIZE;
    const end = Math.min(start + CHUNK_SIZE, file.size);
    const chunk = file.slice(start, end);
    
    // Convert to binary
    const arrayBuffer = await chunk.arrayBuffer();
    
    // Send chunk
    connection.send({
      type: 'FILE_CHUNK',
      fileId,
      chunk: arrayBuffer,
      index: i,
      total: totalChunks
    });
    
    // Update progress
    const progress = ((i + 1) / totalChunks) * 100;
    updateProgress(fileId, progress);
    
    // Small delay to prevent overwhelming
    await new Promise(resolve => setTimeout(resolve, 1));
  }
  
  // Notify completion
  connection.send({
    type: 'FILE_COMPLETE',
    fileId
  });
};
```

### Receiving and Reassembly

```typescript
const receiveFile = () => {
  const chunks = new Map<number, ArrayBuffer>();
  let metadata: FileMetadata;
  
  connection.on('data', (message) => {
    if (message.type === 'FILE_CHUNK') {
      // Store chunk
      chunks.set(message.index, message.chunk);
      
      // Update progress
      const progress = (chunks.size / message.total) * 100;
      updateProgress(message.fileId, progress);
      
      // Check if complete
      if (chunks.size === message.total) {
        // Reassemble file
        const sortedChunks = Array.from(chunks.entries())
          .sort(([a], [b]) => a - b)
          .map(([_, chunk]) => chunk);
        
        // Create blob
        const blob = new Blob(sortedChunks, { 
          type: metadata.type 
        });
        
        // Trigger download
        downloadBlob(blob, metadata.name);
      }
    }
  });
};

const downloadBlob = (blob: Blob, filename: string) => {
  // Create temporary URL
  const url = URL.createObjectURL(blob);
  
  // Create hidden link and click
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  
  // Cleanup
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};
```

---

## Connection Management

### Connection States
```typescript
type ConnectionStatus = 
  | "disconnected"   // No active connection
  | "connecting"     // Establishing connection
  | "connected"      // Active and ready
  | "reconnecting"   // Attempting to restore
  | "error";         // Connection failed
```

### Auto-Reconnection Logic
```typescript
const useAutoReconnect = (peer: Peer, remotePeerId: string) => {
  const [retryCount, setRetryCount] = useState(0);
  const MAX_RETRIES = 5;
  const RETRY_DELAY = 2000; // 2 seconds
  
  const attemptReconnect = useCallback(() => {
    if (retryCount >= MAX_RETRIES) {
      setStatus('error');
      return;
    }
    
    setStatus('reconnecting');
    
    setTimeout(() => {
      const newConnection = peer.connect(remotePeerId);
      
      newConnection.on('open', () => {
        setStatus('connected');
        setRetryCount(0);
      });
      
      newConnection.on('error', () => {
        setRetryCount(prev => prev + 1);
        attemptReconnect();
      });
    }, RETRY_DELAY * Math.pow(2, retryCount)); // Exponential backoff
  }, [retryCount, peer, remotePeerId]);
};
```

### Connection Type Detection
Determines the network path being used:

```typescript
const detectConnectionType = async (
  peerConnection: RTCPeerConnection
): Promise<ConnectionType> => {
  const stats = await peerConnection.getStats();
  
  for (const [_, stat] of stats) {
    if (stat.type === 'candidate-pair' && stat.state === 'succeeded') {
      const localCandidate = stats.get(stat.localCandidateId);
      const remoteCandidate = stats.get(stat.remoteCandidateId);
      
      // Check candidate types
      if (localCandidate?.candidateType === 'host' && 
          remoteCandidate?.candidateType === 'host') {
        return 'direct-p2p'; // Same network
      }
      
      if (localCandidate?.candidateType === 'srflx' || 
          remoteCandidate?.candidateType === 'srflx') {
        return 'stun-server'; // Through STUN
      }
      
      if (localCandidate?.candidateType === 'relay' || 
          remoteCandidate?.candidateType === 'relay') {
        return 'turn-relay'; // Through TURN
      }
    }
  }
  
  return 'unknown';
};
```

**Connection Types Explained:**
- **Direct P2P**: Both peers on same network (fastest)
- **STUN Server**: Public IPs discovered, direct connection (fast)
- **TURN Relay**: All traffic relayed through server (slower but reliable)

---

## Security & Privacy

### Built-in Security Features

#### 1. Mandatory Encryption
WebRTC enforces DTLS (Datagram Transport Layer Security) encryption:
- All data is encrypted end-to-end
- Uses same encryption as HTTPS
- Automatic, cannot be disabled

#### 2. No Server Storage
- Files never uploaded to servers
- Only metadata for matchmaking
- No logs of transferred files
- No user accounts or tracking

#### 3. Ephemeral Connections
- Connections exist only during transfer
- No persistent data storage
- PeerIDs expire after disconnect
- No transfer history

### Privacy Considerations

#### What the Server Sees:
- Peer IDs (random strings)
- Connection timestamps
- IP addresses (for NAT traversal)
- NOT file contents or names

#### What Remains After Transfer:
- Nothing on server
- Browser cache (clearable)
- Download history (browser's)
- Local file (receiver's device)

### Security Best Practices

#### For Users:
1. **Verify Recipients**: Share links only with intended recipients
2. **Use Secure Channels**: Send links via encrypted messaging
3. **Time-Limited Sharing**: Close browser tab after transfer
4. **Network Security**: Use trusted networks for sensitive files

#### For Developers:
1. **Content Security Policy**: Strict CSP headers
2. **Input Validation**: Sanitize all user inputs
3. **Rate Limiting**: Prevent abuse of signaling server
4. **CORS Configuration**: Restrict cross-origin requests

---

## Development Guide

### Prerequisites
- Node.js 20+ 
- pnpm 8+
- Modern browser with WebRTC support

### Local Development Setup

#### 1. Clone and Install
```bash
# Clone the monorepo
git clone https://github.com/your-org/tools-mono.git
cd tools-mono

# Install dependencies
pnpm install

# Start development server
pnpm dev
```

#### 2. Environment Configuration
Create `.env.local` in `apps/nully/`:
```env
# PeerJS Server Configuration
NEXT_PUBLIC_PEERJS_HOST=localhost
NEXT_PUBLIC_PEERJS_PORT=9000
NEXT_PUBLIC_PEERJS_PATH=/peerjs

# TURN Server Configuration (optional)
NEXT_PUBLIC_TURN_URL=turn:localhost:3478
NEXT_PUBLIC_TURN_USERNAME=user
NEXT_PUBLIC_TURN_PASSWORD=pass

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

#### 3. Running PeerJS Server Locally
```bash
# Install PeerJS server
npm install -g peer

# Run server
peerjs --port 9000 --key peerjs --path /peerjs
```

### Testing P2P Locally

#### Same Machine Testing:
1. Open sender: `http://localhost:3000/transfer`
2. Open receiver in incognito: `http://localhost:3000/join/[peerId]`
3. Transfer files between tabs

#### Local Network Testing:
1. Find your local IP: `ipconfig` (Windows) or `ifconfig` (Mac/Linux)
2. Access from another device: `http://192.168.x.x:3000`
3. Test file transfers across devices

### Common Development Tasks

#### Adding New Message Types:
```typescript
// 1. Update interfaces.ts
type PeerMessage = 
  | ExistingMessages
  | { type: 'NEW_MESSAGE'; data: any };

// 2. Handle in sender
connection.on('data', (message) => {
  if (message.type === 'NEW_MESSAGE') {
    handleNewMessage(message.data);
  }
});

// 3. Send from receiver
connection.send({ 
  type: 'NEW_MESSAGE', 
  data: yourData 
});
```

#### Customizing Chunk Size:
```typescript
// lib/constants.ts
export const CHUNK_SIZE = 128 * 1024; // 128KB for faster networks

// Consider:
// - Larger chunks = fewer messages, faster transfer
// - Smaller chunks = better progress granularity, less memory
// - Network conditions affect optimal size
```

#### Adding File Type Restrictions:
```typescript
const ALLOWED_TYPES = [
  'image/jpeg',
  'image/png',
  'application/pdf',
  'text/plain'
];

const validateFile = (file: File): boolean => {
  if (!ALLOWED_TYPES.includes(file.type)) {
    showError(`File type ${file.type} not allowed`);
    return false;
  }
  
  const MAX_SIZE = 100 * 1024 * 1024; // 100MB
  if (file.size > MAX_SIZE) {
    showError('File too large');
    return false;
  }
  
  return true;
};
```

---

## Troubleshooting

### Common Issues and Solutions

#### Connection Fails to Establish

**Symptom**: Receiver can't connect to sender

**Possible Causes & Solutions**:

1. **Firewall Blocking**
   - Solution: Configure TURN server for relay
   - Check: Corporate/school networks often block P2P

2. **Browser Incompatibility**
   - Solution: Update to latest Chrome/Firefox/Edge
   - Check: Safari has limited WebRTC support

3. **PeerJS Server Down**
   - Solution: Check server status, use backup server
   - Check: Network tab for failed requests

#### File Transfer Starts but Doesn't Complete

**Symptom**: Progress stops mid-transfer

**Possible Causes & Solutions**:

1. **Connection Dropped**
   - Solution: Implement auto-reconnection
   - Check: Connection status indicator

2. **Memory Limitations**
   - Solution: Reduce chunk size, clear browser cache
   - Check: Browser memory usage

3. **Network Throttling**
   - Solution: Add delays between chunks
   - Check: Network speed and stability

#### Files Corrupted After Transfer

**Symptom**: Downloaded files won't open

**Possible Causes & Solutions**:

1. **Incomplete Transfer**
   - Solution: Verify all chunks received
   - Check: Progress should reach 100%

2. **Incorrect MIME Type**
   - Solution: Preserve original file type
   - Check: File extension matches content

3. **Binary Data Corruption**
   - Solution: Use ArrayBuffer, not strings
   - Check: Data serialization method

### Debug Mode

Enable detailed logging:

```typescript
// hooks/use-peer-connection.ts
const DEBUG = process.env.NODE_ENV === 'development';

const log = (...args: any[]) => {
  if (DEBUG) {
    console.log('[Nully]', ...args);
  }
};

// Use throughout code
log('Connection established', peerId);
log('File chunk sent', index, '/', total);
```

### Performance Optimization

#### For Large Files:
```typescript
// Adaptive chunk sizing
const getOptimalChunkSize = (fileSize: number): number => {
  if (fileSize < 1_000_000) return 16 * 1024;      // 16KB for < 1MB
  if (fileSize < 10_000_000) return 64 * 1024;     // 64KB for < 10MB
  if (fileSize < 100_000_000) return 256 * 1024;   // 256KB for < 100MB
  return 512 * 1024;                                // 512KB for > 100MB
};

// Stream processing for very large files
const streamLargeFile = async (file: File) => {
  const stream = file.stream();
  const reader = stream.getReader();
  
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    
    await sendChunk(value);
    await throttle(); // Prevent overwhelming
  }
};
```

#### Network Optimization:
```typescript
// Implement backpressure
let sendQueue: Array<() => Promise<void>> = [];
let sending = false;

const queueSend = async (sendFn: () => Promise<void>) => {
  sendQueue.push(sendFn);
  
  if (!sending) {
    sending = true;
    while (sendQueue.length > 0) {
      const fn = sendQueue.shift();
      await fn?.();
      
      // Adaptive delay based on queue size
      const delay = Math.min(sendQueue.length * 10, 100);
      await new Promise(r => setTimeout(r, delay));
    }
    sending = false;
  }
};
```

---

## API Reference

### Hooks

#### `usePeerConnection(options)`
Manages WebRTC peer connection lifecycle.

**Parameters:**
```typescript
interface PeerConnectionOptions {
  initialPeerId?: string;  // For receivers joining
}
```

**Returns:**
```typescript
interface PeerConnectionReturn {
  peer: Peer | null;
  peerId: string | null;
  status: ConnectionStatus;
  connection: DataConnection | null;
  error: string | null;
  connectionType: ConnectionType;
  
  // Methods
  connectToPeer: (remotePeerId: string) => void;
  disconnect: () => void;
  onData: (callback: (data: any) => void) => void;
  sendData: (data: any) => void;
}
```

#### `useFileTransfer(connection)`
Manages file staging and transfer logic.

**Parameters:**
```typescript
interface FileTransferOptions {
  connection: DataConnection | null;
  mode: 'sender' | 'receiver';
}
```

**Returns:**
```typescript
interface FileTransferReturn {
  // State
  stagedFiles: StagedFile[];
  availableFiles: FileMetadata[];
  transferStats: TransferStats;
  
  // Methods
  addFiles: (files: FileList) => void;
  removeFile: (fileId: string) => void;
  requestFile: (fileId: string) => void;
  clearAll: () => void;
}
```

### Components

#### `<SendPage />`
Main component for file senders.

**Props:**
```typescript
interface SendPageProps {
  initialFiles?: File[];
  onConnectionEstablished?: (peerId: string) => void;
  customTurnServers?: RTCIceServer[];
}
```

#### `<ReceivePage />`
Main component for file receivers.

**Props:**
```typescript
interface ReceivePageProps {
  senderPeerId: string;
  onFileReceived?: (file: File) => void;
  autoDownload?: boolean;
}
```

### Utility Functions

#### `formatFileSize(bytes)`
Formats bytes into human-readable size.
```typescript
formatFileSize(1024) // "1 KB"
formatFileSize(1048576) // "1 MB"
```

#### `generateShareableLink(peerId)`
Creates shareable URL for receivers.
```typescript
generateShareableLink("abc123") // "https://nully.app/join/abc123"
```

#### `detectNetworkSpeed(connection)`
Estimates network speed from transfer.
```typescript
const speed = await detectNetworkSpeed(connection);
// Returns: { mbps: 10.5, quality: 'good' }
```

---

## Deployment

### Production Considerations

#### 1. PeerJS Server Setup
```javascript
// peerjs-server.js
const { ExpressPeerServer } = require('peer');
const express = require('express');

const app = express();
const server = app.listen(9000);

const peerServer = ExpressPeerServer(server, {
  debug: true,
  path: '/peerjs',
  allow_discovery: false,
  concurrent_limit: 1000,
  key: process.env.PEERJS_KEY
});

app.use('/peerjs', peerServer);
```

#### 2. TURN Server Deployment (Coturn)
```bash
# Install coturn
apt-get install coturn

# Configure /etc/turnserver.conf
listening-port=3478
fingerprint
use-auth-secret
static-auth-secret=your-secret-key
realm=your-domain.com
cert=/path/to/cert.pem
pkey=/path/to/key.pem
log-file=/var/log/coturn.log
```

#### 3. Next.js Production Build
```bash
# Build for production
pnpm build

# Start production server
pnpm start

# Or use PM2
pm2 start npm --name "nully" -- start
```

### Monitoring & Analytics

Track key metrics without compromising privacy:

```typescript
// Anonymous analytics
const trackTransfer = (stats: TransferStats) => {
  // Track only aggregate data
  analytics.track('file_transfer', {
    file_count: stats.fileCount,
    total_size_category: getSizeCategory(stats.totalBytes),
    duration_seconds: Math.round(stats.duration / 1000),
    connection_type: stats.connectionType,
    // NO file names, contents, or user data
  });
};

const getSizeCategory = (bytes: number): string => {
  if (bytes < 1_000_000) return 'small';      // < 1MB
  if (bytes < 100_000_000) return 'medium';   // < 100MB
  return 'large';                             // > 100MB
};
```

---

## Future Enhancements

### Planned Features
1. **Group Transfers**: Send to multiple receivers simultaneously
2. **Transfer Resume**: Continue interrupted transfers
3. **Folder Support**: Transfer entire folders
4. **Mobile App**: Native iOS/Android apps
5. **E2E Encryption Layer**: Additional encryption on top of WebRTC

### Experimental Features
1. **WebTransport**: Next-gen protocol for better performance
2. **File Streaming**: Start using files before complete download
3. **Compression**: Automatic file compression for faster transfers
4. **QR Code Sharing**: Share connection via QR code

---

## Contributing

We welcome contributions! See our [Contributing Guide](../CONTRIBUTING.md) for details.

### Key Areas for Contribution:
- Performance optimizations
- Additional language translations
- Browser compatibility improvements
- UI/UX enhancements
- Documentation improvements

---

## License

This project is part of the tools-mono monorepo. See [LICENSE](../LICENSE) for details.

---

## Support

For issues, questions, or suggestions:
- GitHub Issues: [github.com/your-org/tools-mono/issues](https://github.com/your-org/tools-mono/issues)
- Documentation: This file
- Community: Discord/Slack (if applicable)

---

*Last Updated: January 2025*
*Version: 1.0.0*