# DokcerDashboard_4c_Ian_Wachter

DockerDash — lightweight dashboard for managing Docker containers with real-time stats.

## Overview
- Backend: Node.js (Express), dockerode, SQLite (better-sqlite3), JWT auth
- Frontend: (vite/react) — serves UI and connects to backend WebSocket for live stats

## Requirements
- Node.js 18+
- Docker (and permission to access /var/run/docker.sock)

## Environment
Create a .env in backend/ with at least:

JWT_SECRET=your_jwt_secret_here
PORT=3000

## Run (development)
1. Backend
   cd backend
   npm install
   npm run dev

2. Frontend
   cd frontend/dockerDashboard
   npm install
   npm run dev

Frontend expects backend at http://localhost:3000 by default. Adjust CORS/origin in backend/index.js if needed.

## WebSocket auth
The frontend connects to ws://localhost:3000/ws/stats?token=<JWT>
Ensure the token is a valid JWT signed with JWT_SECRET.

## Security notes
- Giving a service access to /var/run/docker.sock is powerful. Run with least privilege and avoid exposing the socket to untrusted users.
- Keep JWT_SECRET secret and rotate periodically.

## Next steps
- Add production start scripts and a reverse-proxy (nginx) setup
- Add rate-limiting and improved logging
