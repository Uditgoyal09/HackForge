# HackForge Frontend Architecture Documentation

## 1. Overview
The HackForge frontend is built using **Vite + React (v19)**, **Tailwind CSS**, **Framer Motion**, **TanStack Query (v5)**, **Three.js / React Three Fiber**, and **Matter.js**.

It interfaces directly with the authoritative Node.js/Express/MongoDB backend over RESTful HTTP APIs.

---

## 2. Directory Structure

```
client/src/
├── assets/                  # Static assets & branding
├── components/
│   ├── animations/          # 3D HeroCanvas (R3F) & PhysicsPlayground (Matter.js)
│   ├── common/              # AuthLoadingScreen, Forbidden403, NotFound404, ErrorBoundary, SocialIcons
│   ├── layout/              # Navbar (glassmorphic), NotificationBell, Footer
│   ├── leaderboard/         # LeaderboardView & Top 3 Podium
├── context/
│   └── AuthContext.jsx       # Central session restoration & token state
├── pages/
│   ├── admin/               # AdminDashboard, AdminUserManagement, ActivityLogViewer
│   ├── auth/                # Login, Signup
│   ├── judge/               # JudgeDashboard, EvaluationInterface
│   ├── organizer/           # OrganizerDashboard, CreateHackathon, OrganizerRegistrations, OrganizerTeams, OrganizerSubmissions
│   ├── participant/         # ParticipantDashboard, ParticipantRegistrations, TeamManagement, ProjectSubmission
│   └── public/              # LandingPage, ExploreHackathons, HackathonDetails, PublicProjects, UserProfilePage, NotificationsPage
├── services/
│   ├── api.js               # Axios instance with Bearer JWT interceptor & 401/403 auto-logout
│   ├── authService.js
│   ├── hackathonService.js
│   ├── registrationService.js
│   ├── teamService.js
│   ├── invitationService.js
│   ├── submissionService.js
│   ├── judgeService.js
│   ├── leaderboardService.js
│   ├── notificationService.js
│   ├── adminService.js
│   └── dashboardService.js
├── App.jsx                  # Central Router with ProtectedRoute guards
└── main.jsx                 # QueryClientProvider & Toaster root setup
```

---

## 3. Authentication & Role Security

### Auth Initialization Flow
1. Upon application launch, `AuthContext` checks `localStorage` for `hackforge_token`.
2. If token exists, it calls `GET /api/auth/me` to validate credentials against the backend database.
3. During validation, `AuthLoadingScreen` is rendered to eliminate any UI flashing or unauthorized route rendering.
4. If token is invalid or user is blocked by an admin, session is cleared and user is redirected to `/login`.

### Protected Route Authorization
- Routes use `<ProtectedRoute allowedRoles={['role']}>` to restrict access by role (`admin`, `organizer`, `participant`, `judge`).
- If an unauthorized role attempts access, `<Forbidden403 />` is rendered.
- If unauthenticated, user is redirected to `/login`.

---

## 4. State Management & Server Caching
- **TanStack Query (`@tanstack/react-query`)**: Manages server state, caching, debounced search synchronization, and query invalidation.
- **Form State**: Handled using `react-hook-form` paired with `zod` schema validation for dual create/edit modes.
- **Toast Notifications**: Managed using `sonner` with contextual success/error feedback.

---

## 5. Animation Architecture
- **Framer Motion**: Micro-interactions, modal entrances, card hover effects, and page transitions.
- **Three.js / React Three Fiber**: 3D hero particle node constellation in `HeroCanvas.jsx`.
- **Matter.js**: 2D physics technology badge playground in `PhysicsPlayground.jsx`. Includes engine cleanup on unmount.
