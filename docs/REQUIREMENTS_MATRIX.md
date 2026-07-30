# HackForge Feature Traceability & Requirements Matrix

This document maps every product requirement to its corresponding backend API, frontend component, integration status, and verification state.

| Requirement | Backend Endpoint | Frontend Component / Page | Role Required | Integrated | Tested | Status |
|-------------|------------------|--------------------------|---------------|------------|--------|--------|
| **User Signup** | `POST /api/auth/signup` | `src/pages/auth/Signup.jsx` | Public | Yes | Yes | COMPLETE |
| **User Login** | `POST /api/auth/login` | `src/pages/auth/Login.jsx` | Public | Yes | Yes | COMPLETE |
| **Session Restore** | `GET /api/auth/me` | `src/context/AuthContext.jsx` | Authenticated | Yes | Yes | COMPLETE |
| **Change Password** | `PUT /api/auth/change-password` | `src/pages/public/UserProfilePage.jsx` | Authenticated | Yes | Yes | COMPLETE |
| **Update Profile** | `PUT /api/users/me` | `src/pages/public/UserProfilePage.jsx` | Authenticated | Yes | Yes | COMPLETE |
| **List Hackathons** | `GET /api/hackathons` | `src/pages/public/ExploreHackathons.jsx` | Public | Yes | Yes | COMPLETE |
| **Hackathon Details** | `GET /api/hackathons/:id` | `src/pages/public/HackathonDetails.jsx` | Public | Yes | Yes | COMPLETE |
| **Create Hackathon** | `POST /api/hackathons` | `src/pages/organizer/CreateHackathon.jsx` | Organizer / Admin | Yes | Yes | COMPLETE |
| **Edit Hackathon** | `PUT /api/hackathons/:id` | `src/pages/organizer/CreateHackathon.jsx` | Organizer / Admin | Yes | Yes | COMPLETE |
| **Participant Registration** | `POST /api/hackathons/:id/register` | `src/pages/public/HackathonDetails.jsx` | Participant | Yes | Yes | COMPLETE |
| **My Registrations** | `GET /api/registrations/me` | `src/pages/participant/ParticipantRegistrations.jsx` | Participant | Yes | Yes | COMPLETE |
| **Approve Registration** | `PATCH /api/registrations/:id/approve` | `src/pages/organizer/OrganizerRegistrations.jsx` | Organizer / Admin | Yes | Yes | COMPLETE |
| **Reject Registration** | `PATCH /api/registrations/:id/reject` | `src/pages/organizer/OrganizerRegistrations.jsx` | Organizer / Admin | Yes | Yes | COMPLETE |
| **Create Team** | `POST /api/hackathons/:id/teams` | `src/pages/participant/TeamManagement.jsx` | Participant | Yes | Yes | COMPLETE |
| **Send Team Invitation** | `POST /api/teams/:id/invitations` | `src/pages/participant/TeamManagement.jsx` | Team Leader | Yes | Yes | COMPLETE |
| **Accept Invitation** | `PATCH /api/invitations/:id/accept` | `src/pages/participant/TeamManagement.jsx` | Participant | Yes | Yes | COMPLETE |
| **Project Submission** | `POST/PUT /api/hackathons/:id/submissions` | `src/pages/participant/ProjectSubmission.jsx` | Team Leader | Yes | Yes | COMPLETE |
| **Assign Judge** | `POST /api/submissions/:id/judges/:judgeId` | `src/pages/organizer/JudgeAssignmentModal.jsx` | Organizer / Admin | Yes | Yes | COMPLETE |
| **Judge Assignments** | `GET /api/judge/assignments` | `src/pages/judge/JudgeDashboard.jsx` | Judge | Yes | Yes | COMPLETE |
| **Submit Review** | `POST /api/submissions/:id/reviews` | `src/pages/judge/EvaluationInterface.jsx` | Assigned Judge | Yes | Yes | COMPLETE |
| **Calculated Leaderboard** | `GET /api/hackathons/:id/leaderboard` | `src/components/leaderboard/LeaderboardView.jsx` | Public / Preview | Yes | Yes | COMPLETE |
| **Publish Results** | `PATCH /api/hackathons/:id/publish-results` | `src/pages/organizer/OrganizerSubmissions.jsx` | Organizer / Admin | Yes | Yes | COMPLETE |
| **Notifications** | `GET/PATCH/DELETE /api/notifications` | `src/components/layout/NotificationBell.jsx` | Authenticated | Yes | Yes | COMPLETE |
| **Admin Analytics** | `GET /api/admin/analytics` | `src/pages/admin/AdminDashboard.jsx` | Admin | Yes | Yes | COMPLETE |
| **Admin User Moderation** | `GET/PATCH /api/admin/users/*` | `src/pages/admin/AdminUserManagement.jsx` | Admin | Yes | Yes | COMPLETE |
| **Audit Logs** | `GET /api/admin/activity-logs` | `src/pages/admin/ActivityLogViewer.jsx` | Admin | Yes | Yes | COMPLETE |
| **3D Hero Canvas** | N/A | `src/components/animations/HeroCanvas.jsx` | Public | Yes | Yes | COMPLETE |
| **Matter.js Playground** | N/A | `src/components/animations/PhysicsPlayground.jsx` | Public | Yes | Yes | COMPLETE |
