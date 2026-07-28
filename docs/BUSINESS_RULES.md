# HackVerse Business Rules

## 1. Role-Based Access Control (RBAC)
- **Admin**: Can view and manage all users, block users, change roles, and view global analytics/logs. Can override or moderate hackathons.
- **Organizer**: Can create hackathons, manage registrations, view teams/submissions for their own hackathons, assign judges, and publish results.
- **Judge**: Can only view and evaluate submissions specifically assigned to them.
- **Participant**: Can register, form teams, submit projects, and view published results.

## 2. Hackathon Ownership
- An organizer can only modify, delete, or manage entities related to a Hackathon they created.
- Mass assignment protection strictly prevents an organizer from changing a hackathon's ownership.

## 3. Registration & Team Integrity
- A participant must register for a hackathon before joining or creating a team.
- A participant cannot be in multiple active teams for the same hackathon.
- Teams cannot exceed the `maxTeamSize` specified by the Hackathon.
- Only the team leader can submit the project, invite members, or remove members.
- If a leader leaves, they must transfer leadership first (or the team is disbanded if empty).

## 4. Multi-Document Transactions
- **Team Invitations**: Accepting an invite requires a MongoDB transaction to simultaneously update the Invitation status, push the member to the Team, and log the activity, ensuring no race conditions allow team capacity overflows.
- **Publishing Results**: Locking the hackathon state and calculating final results are wrapped in transactions to guarantee data integrity.

## 5. Submission Deadlines
- The backend strictly enforces the `submissionDeadline`. Any attempt to create or edit a submission after the deadline returns a `403 Forbidden` error, regardless of frontend UI state.

## 6. Judging & Security
- Judges cannot review unassigned submissions.
- Judges submit raw scores per criterion. The backend validates these against the hackathon's `maxScore` constraints and calculates the `totalScore` server-side.
- The `totalScore` payload from the frontend is actively ignored.
- Only one review is allowed per Judge per Submission.

## 7. Leaderboard Determinism
- The leaderboard is calculated dynamically by the backend using the average of submitted review total scores.
- **Tie-breakers** are deterministic:
  1. Highest average score.
  2. Highest average "Innovation" score (if criterion exists).
  3. Highest average "Technical" score (if criterion exists).
  4. Earliest valid submission timestamp.

## 8. Result Privacy
- Submissions and reviews are heavily guarded.
- Participants and the Public cannot view the Leaderboard or other teams' private data until `resultsPublished` is set to true by the Organizer.
- Once published, reviews are locked.
