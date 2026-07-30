# HackForge - Phase 1 Foundation

HackForge is a premium MERN Hackathon Management Platform. This repository contains the Phase 1 foundational setup.

## Tech Stack

### Frontend
- React.js + Vite
- Tailwind CSS
- React Router DOM
- Axios
- Framer Motion
- React Hook Form + Zod
- Lucide React

### Backend
- Node.js + Express
- MongoDB + Mongoose

## Folder Structure

```
hackforge/
├── client/          # Vite + React frontend
├── server/          # Node.js + Express backend
├── README.md
└── .gitignore
```

## Setup Instructions

### Environment Variables

1. Navigate to the `server/` directory.
2. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```
3. Update the `MONGODB_URI` and other variables in the `.env` file.

1. Navigate to the `client/` directory.
2. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```
3. Update the `VITE_API_URL` variable if necessary.

### Backend Setup

1. Open a terminal and navigate to the `server/` directory:
   ```bash
   cd server
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```

### Frontend Setup

1. Open a new terminal and navigate to the `client/` directory:
   ```bash
   cd client
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```

The frontend will usually be accessible at `http://localhost:5173/` and the backend at `http://localhost:5000/`.
