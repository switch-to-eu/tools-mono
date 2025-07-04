# Game Plan: P2P File Transfer Application

**Date**: {{DATE}}
**Feature**: Transform `nully` app into a P2P file transfer client.
**Based on**: `https://github.com/chidokun/p2p-file-transfer`

This document outlines the development plan for creating a peer-to-peer file transfer application within the `nully` app package. The approach is to replace the existing scaffold with new, feature-specific code while integrating with the existing monorepo design system.

---

## Phase 1: Preparation & Scaffolding

This phase involves cleaning the target application directory and installing the necessary dependencies.

- **Task 1.1: Clean Application Slate**
    - **Description**: Remove all existing placeholder components, pages, and libraries from the `nully` app to prepare for the new feature.
    - **Target Files**:
        - `apps/nully/app/page.tsx`
        - `apps/nully/components/*` (delete contents)
        - `apps/nully/server/*` (delete contents)
        - `apps/nully/lib/*` (delete placeholder content)
        - `apps/nully/README.md` (clear content for rewrite)
    - **Dependencies**: None.
    - **Status**: Done.

- **Task 1.2: Install Core Dependency**
    - **Description**: Add the `peerjs` library to the `nully` application's dependencies.
    - **Target Files**:
        - `apps/nully/package.json`
    - **Dependencies**: None.
    - **Status**: Done.

---

## Phase 2: Core Service & UI Implementation

This phase focuses on building the foundational P2P logic and the app-specific UI components.

- **Task 2.1: Define Domain Interfaces**
    - **Description**: Create a file for all necessary TypeScript interfaces, such as `FileTransfer`, `TransferProgress`, and `P2PState`, to ensure type safety.
    - **Target Files**:
        - `apps/nully/lib/interfaces.ts` (new file)
    - **Dependencies**: None.
    - **Status**: Done.

- **Task 2.2: Implement P2P Hook**
    - **Description**: Develop a custom `useP2P` hook to manage the PeerJS instance, connection state, peer ID, and data transfer events. This will be the single source of truth for all P2P logic.
    - **Target Files**:
        - `apps/nully/hooks/use-p2p.ts` (new file)
    - **Dependencies**: Task 1.2, Task 2.1.
    - **Status**: Done.

- **Task 2.3: Develop UI Components**
    - **Description**: Create three app-specific React components for the UI, leveraging `@workspace/ui` components for styling and consistency.
    - **Target Files**:
        - `apps/nully/components/connection-panel.tsx`: Displays peer ID and handles connecting to another peer.
        - `apps/nully/components/transfer-panel.tsx`: Provides file input and controls for sending files.
        - `apps/nully/components/downloads-panel.tsx`: Lists received files and generates download links.
    - **Dependencies**: Task 2.2.
    - **Status**: Done.

---

## Phase 3: Integration and Finalization

This phase involves assembling the application and adding final touches.

- **Task 3.1: Create Homepage**
    - **Description**: Create a simple, static homepage at the root URL (/) with information about the P2P transfer application and a link to the transfer page.
    - **Target Files**:
        - `apps/nully/app/[locale]/page.tsx`
    - **Dependencies**: None.
    - **Status**: Done.

- **Task 3.2: Assemble Transfer Page**
    - **Description**: Integrate the UI components from Phase 2 into the `/transfer` page, composing the main application layout.
    - **Target Files**:
        - `apps/nully/app/[locale]/transfer/page.tsx`
    - **Dependencies**: Task 2.3.
    - **Status**: Done.

- **Task 3.3: Implement File Transfer Logic**
    - **Description**: Add the file sending/receiving logic to the `useP2P` hook, including progress tracking and handling incoming `Blob` data.
    - **Target Files**:
        - `apps/nully/hooks/use-p2p.ts`
    - **Dependencies**: Task 2.2.
    - **Status**: Done.

- **Task 3.4: Implement Error Handling**
    - **Description**: Add user-friendly error handling for connection failures, invalid IDs, and transfer interruptions.
    - **Target Files**:
        - `apps/nully/hooks/use-p2p.ts`
        - All components in `apps/nully/components/`
    - **Dependencies**: Task 3.2, 3.3.
    - **Status**: Done.

- **Task 3.5: Update Documentation**
    - **Description**: Rewrite the `README.md` for the `