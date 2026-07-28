# HackVerse API Documentation

This document outlines the complete REST API specification for the **HackVerse — Hackathon Management Platform**.

**Base URL:** `http://localhost:5000/api`

---

## 1. Authentication (`/api/auth`)

### `POST /api/auth/signup`
- **Access:** Public
- **Description:** Registers a new user. The `role` is strictly forced to `participant` to prevent privilege escalation.
- **Request Body:**
  ```json
  {
    "name": "John Participant",
    "email": "participant@example.com",
    "password": "Password@123"
  }
  ```
- **Response (201 Created):** Returns user details and JWT token.

### `POST /api/auth/login`
- **Access:** Public
- **Description:** Authenticates a user and returns a JWT token (also sets HTTP-only cookie).
- **Request Body:**
  ```json
  {
    "email": "organizer@hackverse.com",
    "password": "password123"
  }
  ```
- **Response (200 OK):** Returns authenticated user object and JWT token.

### `GET /api/auth/me`
- **Access:** Private (Any Role)
- **Header:** `Authorization: Bearer <TOKEN>`
- **Description:** Fetches the profile of the currently logged-in user. Password hash is excluded.
- **Response (200 OK):** User object.

### `PUT /api/auth/change-password`
- **Access:** Private (Any Role)
- **Description:** Changes current password. Validates current password before updating.
- **Request Body:**
  ```json
  {
    "currentPassword": "Password@123",
    "newPassword": "NewPassword@123"
  }
  ```
- **Response (200 OK):** New token and success message.

---

## 2. User Profiles (`/api/users`)

### `PUT /api/users/me`
- **Access:** Private (Any Role)
- **Description:** Updates the profile info (bio, skills, links, college). Mass assignment protection prevents updating `role` or `isBlocked`.
- **Response (200 OK):** Updated user profile.

### `GET /api/users/:id/profile`
- **Access:** Public
- **Description:** Returns the public profile of a user. Omits sensitive fields.
- **Response (200 OK):** Public user object.

---

## 3. Hackathons (`/api/hackathons`)

### `GET /api/hackathons`
- **Access:** Public
- **Query Parameters:** `page`, `limit`, `search`, `mode`, `status`, `registrationStatus`, `sort`
- **Description:** Returns paginated hackathons matching filters and search.

### `POST /api/hackathons`
- **Access:** Private (`organizer`, `admin`)
- **Description:** Creates a new hackathon. `organizer` field is automatically set to `req.user._id`.
- **Request Body:**
  ```json
  {
    "title": "AI Hackathon 2026",
    "description": "Build intelligent agents.",
    "mode": "online",
    "registrationDeadline": "2026-08-01T00:00:00.000Z",
    "startDate": "2026-08-05T00:00:00.000Z",
    "submissionDeadline": "2026-08-10T00:00:00.000Z",
    "endDate": "2026-08-12T00:00:00.000Z",
    "prizePool": 50000,
    "maxTeamSize": 4,
    "judgingCriteria": [
      { "name": "Innovation", "maxScore": 50 },
      { "name": "Technical Execution", "maxScore": 50 }
    ]
  }
  ```

### `GET /api/hackathons/:id`
- **Access:** Public
- **Description:** Returns detailed hackathon information.

### `PUT /api/hackathons/:id`
- **Access:** Private (Hackathon Organizer Owner or `admin`)
- **Description:** Updates hackathon details. Ownership check enforced.

### `PATCH /api/hackathons/:id/registration/open`
- **Access:** Private (Hackathon Organizer Owner or `admin`)
- **Description:** Manually opens registration for the hackathon.

### `PATCH /api/hackathons/:id/registration/close`
- **Access:** Private (Hackathon Organizer Owner or `admin`)
- **Description:** Manually closes registration for the hackathon.

---

## 4. Registrations (`/api/registrations` & `/api/hackathons/:id/register`)

### `POST /api/hackathons/:id/register`
- **Access:** Private (`participant`)
- **Description:** Registers participant for the hackathon (status starts as `pending`).

### `GET /api/registrations/me`
- **Access:** Private (`participant`)
- **Description:** Lists all hackathon registrations for the current participant.

### `GET /api/hackathons/:id/registrations`
- **Access:** Private (Hackathon Organizer Owner or `admin`)
- **Description:** Returns all registered participants for the specified hackathon.

### `PATCH /api/registrations/:id/approve`
- **Access:** Private (Hackathon Organizer Owner or `admin`)
- **Description:** Approves a pending participant registration.

### `PATCH /api/registrations/:id/reject`
- **Access:** Private (Hackathon Organizer Owner or `admin`)
- **Description:** Rejects a participant registration with an optional reason.

---

## 5. Teams & Invitations (`/api/teams` & `/api/invitations`)

### `POST /api/hackathons/:id/teams`
- **Access:** Private (`participant`)
- **Description:** Creates a team for a hackathon. The creator automatically becomes the team leader. Participant must have an approved registration.

### `GET /api/teams/:id`
- **Access:** Private
- **Description:** Returns detailed team information including leader and member profiles.

### `POST /api/teams/:id/invitations`
- **Access:** Private (Team Leader)
- **Description:** Invites a user via email to join the team.
- **Request Body:** `{ "email": "user@example.com" }`

### `GET /api/invitations/me`
- **Access:** Private (`participant`)
- **Description:** Returns pending invitations for the logged-in user's email.

### `PATCH /api/invitations/:id/accept`
- **Access:** Private (`participant`)
- **Description:** Accepts a team invitation using a MongoDB multi-document transaction fallback.

---

## 6. Submissions (`/api/submissions` & `/api/hackathons/:id/submissions`)

### `POST /api/hackathons/:id/submissions`
- **Access:** Private (Team Leader)
- **Description:** Submits a project repository, live demo, tech stack, and optional media files (presentation, screenshots).
- **Request Body:**
  ```json
  {
    "projectName": "CodeGuardian AI",
    "problemStatement": "Security flaws in code",
    "solution": "Automated code auditing",
    "githubRepository": "https://github.com/example/repo",
    "techStack": ["Node.js", "Express", "MongoDB"]
  }
  ```

### `GET /api/submissions/:id`
- **Access:** Private (Team Members, Judge, Organizer, Admin)
- **Description:** Retrieves submission details.

### `PUT /api/submissions/:id`
- **Access:** Private (Team Leader)
- **Description:** Updates submission details before submission deadline.

---

## 7. Judging & Reviews (`/api/judge` & `/api/submissions/:id/reviews`)

### `POST /api/submissions/:id/judges/:judgeId`
- **Access:** Private (Hackathon Organizer Owner or `admin`)
- **Description:** Assigns a judge to evaluate a submission.

### `GET /api/judge/assignments`
- **Access:** Private (`judge`)
- **Description:** Lists all submissions assigned to the authenticated judge.

### `POST /api/submissions/:id/reviews`
- **Access:** Private (Assigned `judge`)
- **Description:** Evaluates a submission. Server automatically calculates `totalScore` from criterion scores and ignores any client-supplied total scores.

---

## 8. Leaderboard & Results (`/api/hackathons/:id/leaderboard`)

### `GET /api/hackathons/:id/leaderboard`
- **Access:** Public (if results published) / Private (Organizer owner preview)
- **Description:** Calculates and returns hackathon rankings using deterministic tie-breaking.

### `PATCH /api/hackathons/:id/publish-results`
- **Access:** Private (Hackathon Organizer Owner or `admin`)
- **Description:** Publishes leaderboard results publicly and locks all reviews against post-publication edits.

---

## 9. Dashboards & Analytics

### `GET /api/participant/dashboard`
- **Access:** Private (`participant`) - Metrics, registrations, and deadlines.

### `GET /api/organizer/analytics`
- **Access:** Private (`organizer`) - Hackathon and team management statistics.

### `GET /api/judge/dashboard`
- **Access:** Private (`judge`) - Assignment and review completion statistics.

### `GET /api/admin/analytics`
- **Access:** Private (`admin`) - Platform-wide statistics.

---

## 10. Admin Control (`/api/admin`)

### `GET /api/admin/users`
- **Access:** Private (`admin`) - Search and list all registered users.

### `PATCH /api/admin/users/:id/block`
- **Access:** Private (`admin`) - Blocks a user account. Blocked users are rejected on login and API requests.

### `PATCH /api/admin/users/:id/unblock`
- **Access:** Private (`admin`) - Restores access for a blocked user.

### `GET /api/admin/activity-logs`
- **Access:** Private (`admin`) - Fetches system activity audit logs.
