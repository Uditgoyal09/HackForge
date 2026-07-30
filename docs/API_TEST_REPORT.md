# HackForge API Verification & Test Report

**Execution Date:** 2026-07-28  
**Environment:** Local Development (Node.js v22, MongoDB, Express)  
**Total Endpoint Tests:** 75  
**Passed:** 75 (100%)  
**Failed:** 0  
**Status:** PASS  

---

## Endpoint Test Execution Matrix

| # | Method | Endpoint | Role / Auth | Test Description | Expected | Actual | Status |
|---|--------|----------|-------------|------------------|----------|--------|--------|
| 1 | GET | `/api/health` | Public | System health check | 200 OK | 200 OK | PASS |
| 2 | GET | `/api/this-route-does-not-exist` | Public | Handle unknown API route | 404 JSON | 404 JSON | PASS |
| 3 | POST | `/api/auth/login` | Public | Admin login with valid credentials | 200 OK | 200 OK | PASS |
| 4 | POST | `/api/auth/login` | Public | Organizer login with valid credentials | 200 OK | 200 OK | PASS |
| 5 | POST | `/api/auth/login` | Public | Judge 1 login with valid credentials | 200 OK | 200 OK | PASS |
| 6 | POST | `/api/auth/login` | Public | Judge 2 login with valid credentials | 200 OK | 200 OK | PASS |
| 7 | POST | `/api/auth/signup` | Public | Participant signup with valid data | 201 Created | 201 Created | PASS |
| 8 | POST | `/api/auth/signup` | Public | Role escalation attack (`role: "admin"`) | Role forced to participant | Role forced to participant | PASS |
| 9 | POST | `/api/auth/signup` | Public | Duplicate email signup | 409 Conflict | 409 Conflict | PASS |
| 10 | POST | `/api/auth/login` | Public | Login with invalid password | 401 Unauthorized | 401 Unauthorized | PASS |
| 11 | GET | `/api/auth/me` | Participant | Get current authenticated user details | 200 (Password omitted) | 200 (Password omitted) | PASS |
| 12 | GET | `/api/auth/me` | None | Unauthenticated access | 401 Unauthorized | 401 Unauthorized | PASS |
| 13 | GET | `/api/auth/me` | Invalid | Access with malformed JWT token | 401 Unauthorized | 401 Unauthorized | PASS |
| 14 | PUT | `/api/auth/change-password` | Participant | Change current password | 200 OK | 200 OK | PASS |
| 15 | PUT | `/api/users/me` | Participant | Update user bio, skills, college | 200 OK | 200 OK | PASS |
| 16 | PUT | `/api/users/me` | Participant | Profile mass assignment attack (`role`, `isBlocked`) | Ignored/Role unchanged | Ignored/Role unchanged | PASS |
| 17 | GET | `/api/users/:id/profile` | Public | Fetch public profile by ID | 200 OK | 200 OK | PASS |
| 18 | POST | `/api/hackathons` | Participant | Participant attempt to create hackathon | 403 Forbidden | 403 Forbidden | PASS |
| 19 | POST | `/api/hackathons` | Organizer | Organizer create valid hackathon | 201 Created | 201 Created | PASS |
| 20 | GET | `/api/hackathons` | Public | List hackathons with pagination | 200 OK | 200 OK | PASS |
| 21 | GET | `/api/hackathons?search=Automated` | Public | Search hackathons by title/keyword | 200 OK | 200 OK | PASS |
| 22 | GET | `/api/hackathons/:id` | Public | Fetch single hackathon details | 200 OK | 200 OK | PASS |
| 23 | GET | `/api/hackathons/invalid-id` | Public | Pass malformed ObjectId string | 400 Bad Request | 400 Bad Request | PASS |
| 24 | PUT | `/api/hackathons/:id` | Organizer 2 | Organizer B update Organizer A hackathon | 403 Forbidden | 403 Forbidden | PASS |
| 25 | PUT | `/api/hackathons/:id` | Organizer 1 | Organizer owner update hackathon | 200 OK | 200 OK | PASS |
| 26 | PATCH | `/api/hackathons/:id/registration/close` | Organizer 1 | Close hackathon registrations | 200 OK | 200 OK | PASS |
| 27 | PATCH | `/api/hackathons/:id/registration/open` | Organizer 1 | Re-open hackathon registrations | 200 OK | 200 OK | PASS |
| 28 | POST | `/api/hackathons/:id/register` | Participant 1 | Register participant for hackathon | 201 Created | 201 Created | PASS |
| 29 | POST | `/api/hackathons/:id/register` | Participant 1 | Duplicate registration attempt | 409 Conflict | 409 Conflict | PASS |
| 30 | GET | `/api/registrations/me` | Participant 1 | Fetch current user registrations | 200 OK | 200 OK | PASS |
| 31 | GET | `/api/hackathons/:id/registrations` | Organizer 2 | Organizer B view Organizer A registrations | 403 Forbidden | 403 Forbidden | PASS |
| 32 | GET | `/api/hackathons/:id/registrations` | Organizer 1 | Organizer owner list registrations | 200 OK | 200 OK | PASS |
| 33 | PATCH | `/api/registrations/:id/approve` | Organizer 1 | Approve participant registration | 200 OK | 200 OK | PASS |
| 34 | POST | `/api/hackathons/:id/teams` | Participant 1 | Create new team as leader | 201 Created | 201 Created | PASS |
| 35 | POST | `/api/hackathons/:id/teams` | Participant 1 | Duplicate team membership attempt | 409 Conflict | 409 Conflict | PASS |
| 36 | GET | `/api/teams/:id` | Participant | Fetch team details | 200 OK | 200 OK | PASS |
| 37 | POST | `/api/teams/:id/invitations` | Participant 1 | Team leader send invite to Participant 2 | 201 Created | 201 Created | PASS |
| 38 | GET | `/api/invitations/me` | Participant 2 | Fetch pending team invitations | 200 OK | 200 OK | PASS |
| 39 | PATCH | `/api/invitations/:id/accept` | Organizer | Wrong user accept invitation attack | 403 Forbidden | 403 Forbidden | PASS |
| 40 | PATCH | `/api/invitations/:id/accept` | Participant 2 | Accept invitation (MongoDB Transaction) | 200 OK | 200 OK | PASS |
| 41 | DELETE | `/api/teams/:id/members/:userId` | Participant 2 | Non-leader remove member attack | 403 Forbidden | 403 Forbidden | PASS |
| 42 | POST | `/api/hackathons/:id/submissions` | Participant 1 | Submit project as team leader | 201 Created | 201 Created | PASS |
| 43 | POST | `/api/hackathons/:id/submissions` | Participant 1 | Duplicate project submission attack | 409 Conflict | 409 Conflict | PASS |
| 44 | GET | `/api/submissions/:id` | Participant | Fetch submission details | 200 OK | 200 OK | PASS |
| 45 | PUT | `/api/submissions/:id` | Organizer 2 | Unauthorized user update submission | 403 Forbidden | 403 Forbidden | PASS |
| 46 | PUT | `/api/submissions/:id` | Participant 1 | Team leader update submission | 200 OK | 200 OK | PASS |
| 47 | POST | `/api/submissions/:id/judges/:judgeId` | Organizer 2 | Organizer B assign judge on Organizer A submission | 403 Forbidden | 403 Forbidden | PASS |
| 48 | POST | `/api/submissions/:id/judges/:judgeId` | Organizer 1 | Assign Judge 1 to submission | 201 Created | 201 Created | PASS |
| 49 | POST | `/api/submissions/:id/judges/:judgeId` | Organizer 1 | Assign Judge 2 to submission | 201 Created | 201 Created | PASS |
| 50 | POST | `/api/submissions/:id/judges/:judgeId` | Organizer 1 | Duplicate judge assignment attempt | 409 Conflict | 409 Conflict | PASS |
| 51 | GET | `/api/judge/assignments` | Judge 1 | Fetch assigned submissions for judge | 200 OK | 200 OK | PASS |
| 52 | POST | `/api/submissions/:id/reviews` | Judge 1 | Submit review (Server calculates totalScore) | 201 Created | 201 Created | PASS |
| 53 | POST | `/api/submissions/:id/reviews` | Judge 2 | Score exceeding maxScore constraint attack | 400 Bad Request | 400 Bad Request | PASS |
| 54 | POST | `/api/submissions/:id/reviews` | Judge 2 | Unknown criterion score attack | 400 Bad Request | 400 Bad Request | PASS |
| 55 | POST | `/api/submissions/:id/reviews` | Judge 1 | Duplicate review submission attack | 409 Conflict | 409 Conflict | PASS |
| 56 | POST | `/api/submissions/:id/reviews` | Judge 2 | Submit valid review 2 | 201 Created | 201 Created | PASS |
| 57 | GET | `/api/submissions/:id/reviews` | Organizer 1 | Fetch submission reviews list | 200 OK | 200 OK | PASS |
| 58 | GET | `/api/hackathons/:id/leaderboard` | Participant | Unpublished leaderboard access attack | 403 Forbidden | 403 Forbidden | PASS |
| 59 | PATCH | `/api/hackathons/:id/publish-results` | Participant | Participant publish results attack | 403 Forbidden | 403 Forbidden | PASS |
| 60 | PATCH | `/api/hackathons/:id/publish-results` | Organizer 2 | Organizer B publish Organizer A results attack | 403 Forbidden | 403 Forbidden | PASS |
| 61 | PATCH | `/api/hackathons/:id/publish-results` | Organizer 1 | Publish hackathon results (MongoDB Transaction) | 200 OK | 200 OK | PASS |
| 62 | GET | `/api/hackathons/:id/leaderboard` | Public | GET published leaderboard | 200 OK | 200 OK | PASS |
| 63 | PUT | `/api/reviews/:id` | Judge 1 | Edit review post-publication lock attack | 403 Forbidden | 403 Forbidden | PASS |
| 64 | GET | `/api/notifications` | Participant | Get user notifications list | 200 OK | 200 OK | PASS |
| 65 | GET | `/api/notifications/unread-count` | Participant | Get unread notification count | 200 OK | 200 OK | PASS |
| 66 | PATCH | `/api/notifications/read-all` | Participant | Mark all notifications as read | 200 OK | 200 OK | PASS |
| 67 | GET | `/api/participant/dashboard` | Participant | Fetch participant dashboard metrics | 200 OK | 200 OK | PASS |
| 68 | GET | `/api/organizer/analytics` | Organizer | Fetch organizer analytics metrics | 200 OK | 200 OK | PASS |
| 69 | GET | `/api/judge/dashboard` | Judge | Fetch judge dashboard metrics | 200 OK | 200 OK | PASS |
| 70 | GET | `/api/admin/analytics` | Participant | Participant access Admin API attack | 403 Forbidden | 403 Forbidden | PASS |
| 71 | GET | `/api/admin/analytics` | Admin | Fetch platform-wide admin analytics | 200 OK | 200 OK | PASS |
| 72 | GET | `/api/admin/users` | Admin | List all registered users | 200 OK | 200 OK | PASS |
| 73 | GET | `/api/admin/activity-logs` | Admin | Fetch system activity audit logs | 200 OK | 200 OK | PASS |
| 74 | PATCH | `/api/admin/users/:id/block` | Admin | Block user account | 200 OK | 200 OK | PASS |
| 75 | GET | `/api/auth/me` | Blocked User | Access API using active JWT for blocked user | 403 Forbidden | 403 Forbidden | PASS |

---

## Security Verification Summary

- **Public Signup Role Escalation:** ✅ PASSED (`role` payload ignored, forced to `participant`).
- **Password Protection:** ✅ PASSED (Hashed with bcrypt, omitted from all API responses).
- **JWT Verification & Revocation:** ✅ PASSED (Invalid JWT rejected, blocked user JWT rejected).
- **Mass Assignment Defense:** ✅ PASSED (`role`, `isBlocked`, `organizer`, `leader` payloads rejected/ignored).
- **RBAC & Authorization:** ✅ PASSED (Participants cannot access Organizer/Admin APIs; Organizers cannot edit other organizers' entities).
- **Review & Leaderboard Security:** ✅ PASSED (`totalScore` calculated server-side, fake client scores overridden, post-publication review edits locked).
- **Input Validation & Sanity:** ✅ PASSED (Invalid ObjectIds return `400 Bad Request`, missing routes return `404 JSON`).
