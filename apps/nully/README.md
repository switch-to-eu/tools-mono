# Nully - Peer-to-Peer File Transfer

Nully is a serverless, peer-to-peer (P2P) file transfer application built with Next.js and WebRTC. It allows users to send files directly between browsers without uploading them to a central server, ensuring privacy, security, and speed.

## How It Works

The application leverages WebRTC for direct, browser-to-browser communication. The entire process is managed on the client-side, with a signaling server used only for initial peer discovery.

### Technical Breakdown

1.  **Peer Connection Setup (via PeerJS)**
    *   **Sender**: When a user visits the `/transfer` page, a `Peer` instance is created using the `usePeerConnection` hook. This instance connects to a PeerJS broker server, which assigns it a unique `peerId`.
    *   **Shareable Link**: The application generates a unique URL containing the sender's `peerId` (e.g., `/join/[peerId]`).
    *   **Receiver**: The receiver opens this link. The `JoinPage` extracts the `peerId` and uses it to initiate a WebRTC `DataConnection` back to the sender.

2.  **Signaling & Handshake**
    *   The PeerJS broker acts as a signaling server, facilitating the initial WebRTC handshake. It helps the two peers exchange session descriptions (SDP) and ICE candidates to establish a direct connection.
    *   Once the connection is established, the signaling server is no longer involved in the communication.

3.  **File Transfer Protocol**
    *   **Staging**: The sender selects files, which are staged locally in the browser. The `useFileTransfer` hook manages this state.
    *   **Metadata Sync**: Upon a successful connection, the sender automatically sends a `FILE_METADATA` message to the receiver. This message contains a list of all staged files (ID, name, size, type). This sync also occurs whenever the sender adds a new file.
    *   **File Request**: The receiver's UI displays the list of available files. When the user clicks "Download", the receiver sends a `FILE_REQUEST` message containing the `fileId` to the sender.
    *   **Chunking & Sending**: Upon receiving a request, the sender's browser reads the requested file into chunks (e.g., 64KB). Each chunk is sent as a `FILE_CHUNK` message over the `DataConnection`.
    *   **Reassembly**: The receiver collects these chunks in memory. Once all chunks for a file have arrived, it reassembles them into a `Blob` with the correct MIME type.
    *   **Download**: The application creates a local object URL from the `Blob` (`URL.createObjectURL`) and programmatically triggers a download in the receiver's browser.

### Core Technologies

*   **Next.js**: Powers the React framework and application structure.
*   **WebRTC**: The core browser technology for real-time, P2P communication.
*   **PeerJS**: A library that simplifies WebRTC peer-to-peer data and media calls.
*   **React Hooks**: State and logic are encapsulated in custom hooks (`usePeerConnection`, `useFileTransfer`) for modularity and reusability.
*   **TypeScript**: Ensures type safety across the application.
