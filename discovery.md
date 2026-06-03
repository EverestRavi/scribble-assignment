# Discovery & Architecture Analysis

This document details the architectural gaps, underlying assumptions, and relevant files identified during the development of the Scribble application.

## 🔴 Concrete Gaps in the Starter Code

1. **Gap 1 in the starter code: Session Restoration & Reconnection Failures**
   - The starter code and subsequent features rely on in-memory React state linked to a volatile `participantId`. If a user refreshes their browser, they lose their session token and the backend throws a "Name is already taken" error if they try to rejoin.
   
2. **Gap 2 in the starter code: Unbounded Memory Growth in Drawing State**
   - The starter code's in-memory data store appends every single drawing coordinate action to the `Room.drawingState` array. Without a database or a snapshotting mechanism, this array grows indefinitely during a round, risking massive payload sizes and high memory consumption on the Node server.

3. **Gap 3 in the starter code: Lack of Secure Authorization**
   - The starter code relies exclusively on unverified client-provided `participantId` strings (passed in headers or bodies) to authorize actions. There are no signed session tokens (like JWTs), meaning any malicious actor could easily intercept or spoof a `participantId` to hijack host privileges or draw on the canvas.

## 🟡 Explicit Assumptions about the Environment and User Behavior

1. **Assumption 1 about the environment: Single-Instance Vertical Scaling**
   - We explicitly assume the application will only ever run on a single Node.js process environment. Because the data store is an in-memory JavaScript `Map` provided by the starter code, deploying this behind a load balancer with multiple instances would result in split-brain state (users hitting different servers wouldn't see the same rooms).

2. **Assumption 2 about user behavior: Honest Client Gameplay**
   - We explicitly assume users act honestly and will not attempt to cheat. The `secretWord` is exposed in the `RoomSnapshot` during the `result` state, and if a bug accidentally exposed it to a guesser, or if a user intercepted network traffic, they could easily cheat. We assume standard cooperative gameplay behavior over implementing complex anti-cheat or strictly obfuscated packet payloads.

3. **Assumption 3 about the environment: Stable Network Polling Tolerance**
   - We explicitly assume the host environment and the client's network are stable enough to handle aggressive, continuous HTTP polling (e.g., 1 request per second) without hitting rate limits or suffering from major latency jitter that would desynchronize drawing strokes.

---

## 📁 Relevant Files

- `backend/src/services/roomStore.ts`
- `backend/src/models/game.ts`
- `backend/src/api/rooms.ts`
- `backend/src/services/drawingService.ts`
- `backend/src/services/guessService.ts`
- `frontend/src/state/roomStore.ts`
- `frontend/src/pages/GamePage.tsx`
