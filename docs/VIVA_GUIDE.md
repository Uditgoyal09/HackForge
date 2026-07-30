# HackForge Capstone Viva & Presentation Guide

## 1. Executive Summary
**HackForge** is a full-stack MERN (MongoDB, Express, React, Node.js) platform for hosting, competing in, and judging hackathons. It automates participant registration, team formation, email invitations, project submissions, dynamic criteria evaluation, server-calculated leaderboards with tie-breaking algorithms, notification alerts, and administrative user moderation.

---

## 2. Technical Stack & Key Architecture Decisions

### Why Node.js + Express + MongoDB?
- **Node.js & Express**: Provides non-blocking, asynchronous I/O ideal for handling concurrent API traffic during hackathon registration bursts.
- **MongoDB & Mongoose**: Schema flexibility supports dynamic judging criteria per hackathon (custom criterion names, descriptions, max scores) without requiring complex SQL migration scripts.
- **Multi-Document Transactions**: MongoDB sessions and transactions guarantee ACID compliance during team invitation acceptances (preventing race conditions that exceed team size limits) and result publication.
- **Standalone Fallback Architecture**: Controllers include fallback logic (`session && session.inTransaction()`) so the application operates seamlessly on both multi-node replica sets and single-node local development environments.

### Why React 19 + Vite + TanStack Query?
- **Vite**: Provides instant HMR (Hot Module Replacement) and optimized production bundling with Rolldown/Vite.
- **TanStack Query (v5)**: Manages server-side cache invalidation automatically. For instance, approving a participant registration immediately invalidates registration queries, participant dashboard states, and organizer metrics.
- **JWT & Role-Based Access Control (RBAC)**: Authentication uses JSON Web Tokens. Passwords are hashed with bcrypt (salt factor 10). Upon boot, the frontend calls `/api/auth/me` while rendering an `AuthLoadingScreen` to prevent UI flashing or unauthorized route rendering.

---

## 3. Core Technical Workflows

### A. Team Formation & Race Condition Prevention
1. Team leader invites a participant by email (`POST /api/teams/:id/invitations`).
2. When the participant accepts (`PATCH /api/invitations/:id/accept`), MongoDB transaction starts.
3. The server validates that the team has not reached `maxTeamSize`, the participant is registered and approved, and the participant is not already in an active team for the hackathon.
4. Updates invitation status to `accepted`, pushes user ID into `team.members`, attaches team ID to `registration.team`, and creates an `ActivityLog` atomically.

### B. Judging & Authoritative Leaderboard Calculation
1. Organizers configure custom criteria (e.g. Innovation: 50 Pts, Technical Execution: 50 Pts).
2. Assigned judges submit evaluation scores per criterion (`POST /api/submissions/:id/reviews`).
3. **Security Defense**: Client-submitted `totalScore` values are actively ignored by the backend. The server recalculates `totalScore` by summing individual criteria scores and validating them against `maxScore` boundaries.
4. **Deterministic Tie-Breaking**:
   - Primary: Highest average total score across submitted reviews.
   - 1st Tie-breaker: Highest average Innovation score.
   - 2nd Tie-breaker: Highest average Technical Execution score.
   - 3rd Tie-breaker: Earliest submission timestamp.
5. **Leaderboard Privacy Lock**: Public access to `/leaderboard` returns `403 Forbidden` until the organizer triggers `PATCH /api/hackathons/:id/publish-results`. Publishing locks all reviews against post-publication edits.

---

## 4. Frequently Asked Viva Questions & Answers

**Q1: How do you handle privilege escalation during user registration?**  
*Answer:* The backend signup controller strictly forces `role: "participant"` regardless of any `role` field present in the incoming JSON body payload. Roles like `organizer`, `judge`, or `admin` can only be granted by an authenticated Super Admin or seeded.

**Q2: How does the application handle offline or local single-node MongoDB setups without replica sets?**  
*Answer:* Controllers wrap session operations in try/catch blocks. If MongoDB returns a `replica set required` error on transaction start, the system safely falls back to executing single-document updates, ensuring 100% test compatibility.

**Q3: How do you prevent double-submissions or form double-clicks?**  
*Answer:* Frontend submit buttons enter a disabled loading state immediately upon submission. On the backend, unique compound indexes (e.g., `{ hackathon: 1, team: 1 }` on Submissions and `{ submission: 1, judge: 1 }` on Reviews) reject duplicate requests with `409 Conflict`.

**Q4: How are heavy animations and 3D scenes optimized for weak devices?**  
*Answer:* The 3D particle constellation in `HeroCanvas.jsx` uses Three.js geometry buffer attributes and `@react-three/fiber` lazy rendering. Matter.js physics engine in `PhysicsPlayground.jsx` automatically stops and cleans up engine worlds on component unmount to prevent memory leaks.
