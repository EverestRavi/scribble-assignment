# Discovery & Architecture Analysis

This document details the architectural gaps, underlying assumptions, and relevant files identified during the development of the Scribble application.

## 🔴 Architectural Gaps & Vulnerabilities

1. **Session Restoration & Reconnection Failures**
   - **Gap**: If a user accidentally refreshes their browser during gameplay, their local React state is destroyed. The backend considers them still active (until the 10-second inactivity timeout), but the user cannot seamlessly rejoin. Attempting to rejoin with the same name throws a "Name is already taken" error.
   - **Impact**: High. Players lose progress and access to the game on a simple page reload.
   
2. **Unbounded Memory Growth in Drawing State**
   - **Gap**: The `drawingState` array in `Room` appends every single drawing coordinate action. Since there is no database, this lives entirely in-memory. Over a long drawing round, this array can become massive, causing the payload of the 1-second polling `GET /api/rooms/:code` request to explode in size.
   - **Impact**: Medium to High. Can lead to severe network latency, high CPU usage for serialization, and potential Node.js Out-Of-Memory (OOM) crashes.

3. **Lack of Secure Authorization**
   - **Gap**: The system relies on self-reported `participantId` values in request bodies and headers to authorize actions (e.g., submitting a drawing or ending the game). There are no secure session tokens (JWTs) or signed cookies.
   - **Impact**: Medium. A malicious actor who guesses or intercepts a `participantId` can easily spoof actions, hijack the host privileges, or draw on the canvas when they are supposed to be guessing.

4. **Synchronous Polling Desynchronization**
   - **Gap**: Because state sync relies exclusively on HTTP polling (mandated by the "No WebSockets" rule) every 1-2 seconds, clients are inherently desynchronized. A guesser might see a stroke 2 seconds after it was drawn, leading to awkward timing where a correct guess feels delayed.
   - **Impact**: Low. It degrades the real-time "feel" of the game but does not break core functionality.

---

## 🟡 Development Assumptions

1. **Single-Instance Deployment (Vertical Scaling Only)**
   - **Assumption**: We assume the backend will only ever run on a single Node.js process. Because the datastore is a simple JavaScript `Map` (`rooms`), putting this application behind a load balancer with multiple instances would result in split-brain state (users hitting different servers wouldn't see the same rooms).

2. **Network Stability & Polling Tolerance**
   - **Assumption**: We assume users have relatively stable internet connections capable of handling continuous, heavy HTTP polling (1 request per second). We assume that the server will not rate-limit these users and that the overhead of HTTP headers on every stroke update is acceptable.

3. **Honest Clients (No Cheat Prevention)**
   - **Assumption**: We assume clients act honestly. For example, the `secretWord` is currently exposed in the `RoomSnapshot` to the drawer and in the `result` state. If a bug accidentally exposed the secret word to a guesser's payload, or if a user inspected the network tab, they could easily cheat. We assume standard gameplay over bulletproof anti-cheat mechanisms for this MVP.

---

## 📁 Relevant Files

- **Backend State Management**: 
  - `backend/src/services/roomStore.ts` (Handles in-memory Map, garbage collection, and game transitions)
  - `backend/src/models/game.ts` (Defines the `Room` and `Participant` interfaces)
- **Backend API & Services**:
  - `backend/src/api/rooms.ts` (API routes relying on unverified `participantId`)
  - `backend/src/services/drawingService.ts` (Appends to the unbounded `drawingState` array)
  - `backend/src/services/guessService.ts` (Evaluates correctness and modifies scores)
- **Frontend State & UI**:
  - `frontend/src/state/roomStore.ts` (Manages the HTTP polling intervals)
  - `frontend/src/pages/GamePage.tsx` (Coordinates the canvas, guesses, and polling lifecycle)
