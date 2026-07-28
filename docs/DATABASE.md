# HackVerse Database Schema Documentation

## Mongoose Collections

### 1. `RoleAccessCode`
Stores cryptographically hashed verification codes for Organizer and Judge onboarding.
```javascript
{
  codeHash: { type: String, required: true, unique: true, index: true },
  role: { type: String, enum: ['organizer', 'judge'], required: true },
  label: { type: String, required: true, trim: true },
  isActive: { type: Boolean, default: true },
  expiresAt: { type: Date, required: true },
  maxUses: { type: Number, default: 1, min: 1 },
  usedCount: { type: Number, default: 0, min: 0 },
  createdBy: { type: ObjectId, ref: 'User', required: true },
  lastUsedAt: { type: Date }
}
```

### 2. `User`
```javascript
{
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, index: true },
  password: { type: String, required: true, select: false },
  role: { type: String, enum: ['participant', 'organizer', 'judge', 'admin'], default: 'participant' },
  isBlocked: { type: Boolean, default: false },
  profile: {
    bio: String,
    skills: [String],
    college: String,
    organizationName: String,
    expertise: String,
    github: String,
    linkedin: String,
    portfolio: String
  }
}
```
*(Additional collections: `Hackathon`, `Registration`, `Team`, `Invitation`, `Submission`, `Review`, `Notification`, `ActivityLog`)*
