# HackVerse REST API Documentation

## Authentication Endpoints

### 1. Register User
- **POST** `/api/auth/signup`
- **Access:** Public
- **Request Body (Participant):**
  ```json
  {
    "name": "John Doe",
    "email": "john@example.com",
    "password": "Password123",
    "role": "participant",
    "profile": {
      "college": "Stanford University",
      "skills": ["React", "Node.js"]
    }
  }
  ```
- **Request Body (Organizer / Judge):**
  ```json
  {
    "name": "Jane Organizer",
    "email": "jane@example.com",
    "password": "Password123",
    "role": "organizer",
    "verificationCode": "ORG-A1B2C3D4",
    "profile": {
      "organizationName": "Stanford Tech Club"
    }
  }
  ```
- **Response (201 Created):**
  ```json
  {
    "success": true,
    "message": "ORGANIZER registered successfully",
    "data": {
      "_id": "60d5ec49f1b2c52b0c8e1234",
      "name": "Jane Organizer",
      "email": "jane@example.com",
      "role": "organizer",
      "token": "eyJhbGciOiJIUzI1Ni..."
    }
  }
  ```

### 2. Login User with Portal Verification
- **POST** `/api/auth/login`
- **Access:** Public
- **Request Body:**
  ```json
  {
    "email": "jane@example.com",
    "password": "Password123",
    "loginAs": "organizer"
  }
  ```
- **Response (200 OK):**
  ```json
  {
    "success": true,
    "message": "Logged in successfully",
    "data": {
      "_id": "60d5ec49f1b2c52b0c8e1234",
      "name": "Jane Organizer",
      "email": "jane@example.com",
      "role": "organizer",
      "token": "eyJhbGciOiJIUzI1Ni..."
    }
  }
  ```
- **Error Response (403 Forbidden - Portal Mismatch):**
  ```json
  {
    "success": false,
    "message": "This account is registered as a participant and cannot log into the admin portal"
  }
  ```

---

## Admin Access Code Management Endpoints

### 1. Generate Role Access Code
- **POST** `/api/admin/access-codes`
- **Access:** Private (Admin)
- **Request Body:**
  ```json
  {
    "role": "organizer",
    "label": "University Partner Access Code",
    "expiresAt": "2028-12-31",
    "maxUses": 1
  }
  ```
- **Response (201 Created):**
  ```json
  {
    "success": true,
    "data": {
      "_id": "60d5ec49f1b2c52b0c8e9999",
      "codeHash": "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
      "role": "organizer",
      "label": "University Partner Access Code",
      "maxUses": 1,
      "usedCount": 0
    },
    "rawCode": "ORG-A1B2C3D4"
  }
  ```
  *(Note: `rawCode` is returned ONCE upon creation for Admin to copy. Only `codeHash` is stored in MongoDB.)*

### 2. List Access Codes
- **GET** `/api/admin/access-codes`
- **Access:** Private (Admin)
- **Response (200 OK):**
  ```json
  {
    "success": true,
    "data": [
      {
        "_id": "60d5ec49f1b2c52b0c8e9999",
        "role": "organizer",
        "label": "University Partner Access Code",
        "maxUses": 1,
        "usedCount": 0,
        "status": "ACTIVE",
        "expiresAt": "2028-12-31T00:00:00.000Z"
      }
    ]
  }
  ```

### 3. Revoke Access Code
- **PATCH** `/api/admin/access-codes/:id/revoke`
- **Access:** Private (Admin)
- **Response (200 OK):**
  ```json
  {
    "success": true,
    "message": "Access code revoked successfully"
  }
  ```
