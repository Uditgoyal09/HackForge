# HackVerse Business Rules & Security Directives

## 1. Authentication & Security Directives
1. **Public Signup Roles:** Public signup allows selecting `Participant`, `Organizer` (requires valid code), or `Judge` (requires valid code). Public `Admin` signup attempts are rejected with `400 Bad Request`.
2. **Access Code Security:** `RoleAccessCode` records store `codeHash` (SHA-256) only. Raw codes are generated cryptographically using Node.js `crypto` and returned ONCE to the Admin upon creation.
3. **Cross-Role Code Defense:** An Organizer code cannot create a Judge account, and a Judge code cannot create an Organizer account.
4. **Single-Use Atomic Rollback:** Code usage (`usedCount`) is incremented inside MongoDB session transactions. If user creation fails, code usage is rolled back automatically.
5. **Portal Matching on Login:** Login requests pass `{ email, password, loginAs }`. The backend verifies password AND checks `user.role === loginAs`. If a Participant attempts to log into the Admin portal, login is rejected with `403 Forbidden`.
6. **CLI Admin Bootstrap:** Super Admin initial creation is performed via controlled CLI script `npm run create:admin`.
7. **Zero Seed Dependency & Clean Boot:** Booting with an empty MongoDB database produces a clean, functional 100% empty application without pre-seeded hackathons or demo users.
