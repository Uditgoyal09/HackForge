# HackVerse Database Schema

## Overview
The HackVerse database is structured to enforce strong relational integrity while leveraging MongoDB's flexibility. Below are the primary models and their relationships.

### Models

1. **User**
   - Stores account information, profile data, and roles.
   - Roles: `admin`, `organizer`, `participant`, `judge`.
   - Security: Passwords are encrypted with bcrypt, block status is tracked explicitly.

2. **Hackathon**
   - Owned by an Organizer (User ref).
   - Tracks important lifecycle dates (startDate, endDate, registrationDeadline, submissionDeadline).
   - Contains dynamic `judgingCriteria`.

3. **Registration**
   - Links a Participant (User ref) to a Hackathon.
   - Tracks approval status (pending, approved, rejected).

4. **Team**
   - Links multiple Participants to a Hackathon.
   - Enforces a designated Leader.
   - Generates unique invite codes for joining.

5. **Invitation**
   - Manages the asynchronous flow of inviting a user via email.
   - Links to Team and Hackathon. Tracks expiration dates.

6. **Submission**
   - Links a Team's project to a Hackathon.
   - Stores project metadata, tech stack, and Cloudinary assets (presentations, screenshots).

7. **JudgeAssignment**
   - Maps a Judge (User ref) to a specific Submission.
   - Required before a judge can submit a review.

8. **Review**
   - Contains a Judge's evaluation of a Submission.
   - Enforces scores against the Hackathon's `judgingCriteria`.
   - Calculates the `totalScore` securely on the backend.

9. **Notification**
   - Stores in-app alerts for users (e.g., team invites, registration approvals).

10. **ActivityLog**
    - Audit trail for Admin oversight. Tracks destructive operations, role changes, and major platform events.

### Entity Relationship Diagram
```text
User (Organizer)
  |
  | creates
  v
Hackathon
  |
  +----> Registrations (Participant links)
  |
  +----> Teams (Participant groups)
           |
           +----> Invitations
  |
  +----> Submissions (Projects by Teams)
           |
           +----> JudgeAssignments (Links Judge to Submission)
           |
           +----> Reviews (Evaluations by Judges)
```
