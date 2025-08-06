# PeerJS Custom Server Migration Plan

**Feature**: Migrate PeerJS configuration to use custom server at `https://null-peer-server.sliplane.app/`
**Date**: 2025-08-06
**Target App**: `apps/nully` (P2P File Transfer Application)

## Executive Summary

This plan outlines a **non-destructive migration** from the default PeerJS server (0.peerjs.com) to a custom PeerJS server at `https://null-peer-server.sliplane.app/`. The migration addresses current connection reliability issues including ICE failures and server unavailability that are preventing peer-to-peer connections.

## Current State Analysis

### Identified Issues
- **ICE Connection Failures**: "WebRTC: ICE failed, your TURN server appears to be broken"
- **Server Connection Issues**: "Could not connect to peer" errors
- **Asymmetric Connection States**: Sender shows "connected" while receiver remains "Connecting..."
- **Default Server Unreliability**: Using default `0.peerjs.com` which has intermittent issues

### Current Implementation
- **Primary Hook**: `apps/nully/hooks/use-peer-connection.ts` (Line 37)
- **Current Configuration**: `new Peer(initialPeerId)` - uses default server
- **PeerJS Version**: `^1.5.5` (from package.json)
- **Usage Points**: Transfer pages, join pages, components

## Migration Roadmap

### Phase 1: Analysis & Preparation (Risk Level: LOW)
**Objective**: Understand current implementation and prepare configuration strategy

#### Tasks:
1. **Server Compatibility Verification**
   - **Target Files**: N/A (External verification)
   - **Dependencies**: None
   - **Test Conditions**: Verify `https://null-peer-server.sliplane.app/` is accessible and responds correctly to PeerJS protocol

2. **Configuration Strategy Design**
   - **Target Files**: `apps/nully/lib/peer-config.ts` (new file)
   - **Dependencies**: Task 1 completion
   - **Test Conditions**: Configuration object exports without TypeScript errors

3. **Environment Variable Setup**
   - **Target Files**: `apps/nully/.env.example`, `apps/nully/.env.local`
   - **Dependencies**: Task 2 completion
   - **Test Conditions**: Environment variables load correctly in development

### Phase 2: Configuration Implementation (Risk Level: LOW)
**Objective**: Create centralized PeerJS configuration without changing existing logic

#### Tasks:
1. **Create Configuration Module**
   - **Target Files**: `apps/nully/lib/peer-config.ts` (create)
   - **Dependencies**: Phase 1 completion
   - **Test Conditions**: Module exports valid PeerJS configuration object

2. **Add TypeScript Interfaces**
   - **Target Files**: `apps/nully/lib/interfaces.ts` (extend existing)
   - **Dependencies**: Task 1 completion
   - **Test Conditions**: TypeScript compilation succeeds without errors

3. **Environment Configuration**
   - **Target Files**:
     - `apps/nully/src/env.ts` (if exists, extend)
     - `apps/nully/next.config.ts` (extend env validation)
   - **Dependencies**: Task 2 completion
   - **Test Conditions**: Environment variables validate on application start

### Phase 3: Hook Migration (Risk Level: MEDIUM)
**Objective**: Update `usePeerConnection` hook to use custom server configuration

#### Tasks:
1. **Update Hook Implementation**
   - **Target Files**: `apps/nully/hooks/use-peer-connection.ts` (Line 37)
   - **Dependencies**: Phase 2 completion
   - **Test Conditions**: Hook initializes without breaking existing functionality

2. **Add Connection Health Checks**
   - **Target Files**: `apps/nully/hooks/use-peer-connection.ts` (extend)
   - **Dependencies**: Task 1 completion
   - **Test Conditions**: Connection status updates correctly reflect actual connection state

3. **Implement Enhanced Connection Retry Logic**
   - **Target Files**: `apps/nully/hooks/use-peer-connection.ts` (extend existing retry)
   - **Dependencies**: Task 2 completion
   - **Test Conditions**: Failed connections retry with exponential backoff, multiple retry strategies implemented


### Phase 4: Testing & Validation (Risk Level: LOW)
**Objective**: Ensure migration doesn't break existing functionality

#### Tasks:
1. **Unit Testing**
   - **Target Files**: `apps/nully/hooks/__tests__/use-peer-connection.test.ts` (create if needed)
   - **Dependencies**: Phase 3 completion
   - **Test Conditions**: All hook behaviors work as expected with new configuration

2. **Integration Testing**
   - **Target Files**: Existing page components
   - **Dependencies**: Task 1 completion
   - **Test Conditions**:
     - Transfer page loads without errors
     - Join page connects to sender successfully
     - File transfer completes successfully
     - Connection status displays accurately

3. **Cross-Browser Testing**
   - **Target Files**: N/A (Manual testing)
   - **Dependencies**: Task 2 completion
   - **Test Conditions**: Functionality works across Chrome, Firefox, Safari, Edge

### Phase 5: Deployment & Monitoring (Risk Level: LOW)
**Objective**: Deploy changes and monitor for improvements

#### Tasks:
1. **Gradual Rollout Configuration**
   - **Target Files**: `apps/nully/lib/peer-config.ts` (feature flag)
   - **Dependencies**: Phase 4 completion
   - **Test Conditions**: Feature flag toggles between old and new server configuration

2. **Error Monitoring Enhancement**
   - **Target Files**: `apps/nully/hooks/use-peer-connection.ts` (logging)
   - **Dependencies**: Task 1 completion
   - **Test Conditions**: Connection errors log with sufficient detail for debugging

3. **Performance Metrics**
   - **Target Files**: `apps/nully/hooks/use-peer-connection.ts` (metrics)
   - **Dependencies**: Task 2 completion
   - **Test Conditions**: Connection success rate and latency metrics are captured

## Detailed Implementation Strategy

### Non-Destructive Approach
1. **Configuration Externalization**: Move hardcoded server config to external files
2. **Feature Flagging**: Allow toggling between old and new servers
3. **Graceful Degradation**: Fallback to default server if custom server fails
4. **Backward Compatibility**: Maintain existing API surface of `usePeerConnection`

### Risk Mitigation
- **Environment-Based Rollout**: Test in development before production
- **Monitoring**: Enhanced logging to catch issues early
- **Rollback Plan**: Feature flag allows instant revert to original behavior
- **Progressive Enhancement**: New features don't break existing functionality

## Success Criteria

### Technical Metrics
- **Connection Success Rate**: >95% peer connection establishment
- **Connection Latency**: <3 seconds for initial connection
- **Error Reduction**: 80% reduction in ICE-related connection failures
- **Stability**: Zero regressions in existing file transfer functionality

### User Experience Metrics
- **Sender State Accuracy**: Sender status reflects actual connection state
- **Receiver Connection**: Receivers successfully connect without hanging on "Connecting..."
- **Transfer Reliability**: File transfers complete successfully >98% of the time


## File Structure Impact

```
apps/nully/
├── lib/
│   ├── peer-config.ts          # New - PeerJS configuration
│   └── interfaces.ts           # Modified - Add PeerJS config types
├── hooks/
│   └── use-peer-connection.ts  # Modified - Use new configuration
├── .env.example                # Modified - Add PEERJS_SERVER_URL
├── .env.local                  # Modified - Add development config
└── next.config.ts              # Modified - Environment validation
```

## Dependencies & Prerequisites

### External Dependencies
- Custom PeerJS server at `https://null-peer-server.sliplane.app/` must be operational
- Server must support PeerJS protocol version compatible with client v1.5.5
- Server must have reliable TURN/STUN configuration for NAT traversal

### Internal Dependencies
- No breaking changes to existing `usePeerConnection` API
- Maintain compatibility with current PeerJS version (1.5.5)
- Preserve existing reconnection and error handling logic

## Rollback Strategy

### Immediate Rollback (< 5 minutes)
1. Set environment variable `PEERJS_USE_CUSTOM_SERVER=false`
2. Restart application
3. Connections revert to default `0.peerjs.com` server

### Configuration Rollback (< 15 minutes)
1. Revert changes to `use-peer-connection.ts`
2. Remove custom configuration imports
3. Deploy previous working version

## Post-Migration Monitoring

### Key Metrics to Track
- **Connection establishment time**
- **Connection failure rates by error type**
- **ICE negotiation success rates**
- **Data transfer success rates**
- **User-reported connection issues**

### Monitoring Duration
- **Intensive monitoring**: First 48 hours post-deployment
- **Regular monitoring**: Ongoing via existing error tracking
- **Review checkpoint**: 1 week post-deployment for success evaluation

---

**Plan Status**: Draft - Ready for Review
**Next Steps**: Review plan with team, gather feedback, begin Phase 1 implementation