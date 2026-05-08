# Team Task Manager

Team Task Manager is a full-stack project management app for teams to organize projects, assign work, and track task progress.

## Features

- JWT authentication (signup, login, current user)
- Role-based access control (Admin / Member)
- Project CRUD with team membership management
- Task CRUD with assignment, due dates, and status workflow
- Personal dashboard with task/project summary and overdue tasks
- Responsive React UI

## Tech Stack

| Layer | Technology |
|---|---|
| Backend | FastAPI, SQLAlchemy, Pydantic |
| Database | SQLite (default), PostgreSQL via `DATABASE_URL` |
| Frontend | React 18, Redux Toolkit, Vite |
| Auth | JWT (`python-jose`), bcrypt (`passlib`) |
| Deployment | Railway (backend), Vercel (frontend) |

## Project Structure

```text
team-task-manager/
├── backend/
│   ├── auth/
│   ├── routers/
│   ├── main.py
│   ├── database.py
│   ├── models.py
│   ├── schemas.py
│   ├── requirements.txt
│   └── railway.json
├── frontend/
│   ├── src/
│   ├── package.json
│   └── vite.config.js
├── vercel.json
└── README.md
```

## Getting Started

### Prerequisites

- Python 3.11+
- Node.js 18+

### 1) Backend setup

```bash
cd backend
python -m venv venv
source venv/bin/activate   # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
uvicorn main:app --reload --port 8000
```

Backend API:
- Root: `http://localhost:8000/`
- Docs: `http://localhost:8000/docs`
- Health: `http://localhost:8000/health`

### 2) Frontend setup

```bash
cd frontend
npm install
cp .env.example .env.local
npm run dev
```

Frontend app: `http://localhost:5173`

> In development, Vite proxies `/api` requests to `http://localhost:8000`.

## Environment Variables

### Backend (`backend/.env`)

| Variable | Description | Default |
|---|---|---|
| `SECRET_KEY` | JWT signing key (required in production) | `your-super-secret-key-change-this-in-production` |
| `ALGORITHM` | JWT algorithm | `HS256` |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | Token expiration in minutes | `30` |
| `DATABASE_URL` | SQLAlchemy database URL | `sqlite:///./taskmanager.db` |
| `CORS_ORIGINS` | Comma-separated allowed origins | `http://localhost:5173,http://localhost:3000` |

### Frontend (`frontend/.env.local`)

| Variable | Description |
|---|---|
| `VITE_API_URL` | Backend base URL (leave empty for Vite proxy in local dev) |

## Available Scripts

### Frontend (`frontend/package.json`)

- `npm run dev` — start Vite dev server
- `npm run build` — create production build
- `npm run preview` — preview production build
- `npm run lint` — run ESLint

## API Overview

### Auth (`/api/auth`)
- `POST /signup`
- `POST /login`
- `GET /me`
- `POST /logout`

### Projects (`/api/projects`)
- `GET /`
- `POST /`
- `GET /{project_id}`
- `PUT /{project_id}`
- `DELETE /{project_id}`
- `GET /{project_id}/members`
- `POST /{project_id}/members`
- `PUT /{project_id}/members/{user_id}`
- `DELETE /{project_id}/members/{user_id}`

### Tasks (`/api/tasks`)
- `GET /` (supports `project_id`, `status`, `assigned_to_me`)
- `POST /`
- `GET /{task_id}`
- `PUT /{task_id}`
- `DELETE /{task_id}`

### Dashboard (`/api/dashboard`)
- `GET /`

## Deployment

### Backend on Railway

Backend config lives in `backend/railway.json`:
- Builder: `RAILPACK`
- Start command: `uvicorn main:app --host 0.0.0.0 --port $PORT`

Set at least:
- `SECRET_KEY`
- `DATABASE_URL` (recommended PostgreSQL in production)
- `CORS_ORIGINS` (your frontend domain)

### Frontend on Vercel

`vercel.json` is configured to:
- build from `frontend/`
- output `frontend/dist`
- rewrite all routes to `index.html` (SPA routing)

Set:
- `VITE_API_URL=https://<your-backend-domain>`

## License

MIT
