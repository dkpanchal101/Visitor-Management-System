# SecureVMS — Facial Recognition Visitor Management System

Enterprise-style visitor tracking with real-time facial recognition, role-based access control, security logging, and entry/exit duration tracking.

## Features

- **Live facial recognition** — Real-time detection and matching against enrolled visitors
- **Role-based access** — `SUPER_ADMIN` (user management) and `ADMIN` (operations)
- **Visitor enrollment** — Register faces with optional blacklist flag
- **Security audit** — Snapshots, optional video clips, CSV export
- **Visit tracking** — Automatic check-in / check-out with duration
- **Production-ready basics** — JWT auth on APIs, CORS config, rate-limited login, env-based URLs

## Tech stack

| Layer | Technologies |
|-------|----------------|
| Frontend | React 19, Vite, Tailwind, React Router, Socket.IO |
| Backend | Node.js, Express, SQLite, face-api.js, JWT |

## Quick start

### 1. Backend (Node 18.19.0)

```bash
cd backend
cp .env.example .env
# Edit .env — set JWT_SECRET for anything beyond local dev
npm install
node server.js
```

Runs on **http://localhost:5000**

### 2. Frontend (Node 20.19.0)

```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

Open **http://localhost:5173**

### Default accounts

| Role | Username | Password |
|------|----------|----------|
| Super Admin | `superadmin` | `super123` |
| Admin | `admin` | `admin123` |

**Change these before production.**

## Environment variables

### Backend (`backend/.env`)

| Variable | Description |
|----------|-------------|
| `JWT_SECRET` | Required in production — long random string |
| `PORT` | Server port (default `5000`) |
| `CORS_ORIGINS` | Comma-separated frontend URLs |
| `FACE_MATCH_THRESHOLD` | `0.45`–`0.60` (default `0.55`) |

### Frontend (`frontend/.env`)

| Variable | Description |
|----------|-------------|
| `VITE_API_URL` | e.g. `http://localhost:5000/api` |
| `VITE_MEDIA_URL` | e.g. `http://localhost:5000` |
| `VITE_SOCKET_URL` | e.g. `http://localhost:5000` |

## Production checklist

- [ ] Set strong `JWT_SECRET`
- [ ] Change default admin passwords
- [ ] Set `NODE_ENV=production`
- [ ] Configure `CORS_ORIGINS` to your frontend domain only
- [ ] Use HTTPS in front of the API
- [ ] Back up `backend/database/vms.db` regularly
- [ ] Deploy frontend with matching `VITE_*` URLs

## Project structure

```
backend/
  constants/roles.js    # Role normalization
  database/db.js        # SQLite schema + migrations
  face/faceService.js   # AI models
  middleware/           # Auth, errors
  routes/               # REST API

frontend/
  src/
    components/       # Layout, alerts, UI
    context/            # Auth, toasts
    pages/              # App views
```

## Camera configuration

Edit `videoConstraints` in `frontend/src/pages/Detect.jsx`:

- `facingMode: "user"` — front camera (default)
- `facingMode: "environment"` — rear camera
