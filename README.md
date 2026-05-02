# Team Task Manager

A production-ready full-stack team task management system with authentication, role-based access control, and task tracking.

## 🚀 Live Demo

- **Frontend:** [Deploy to Vercel](#deployment)
- **Backend API:** [Deploy to Railway](#deployment)
- **API Docs:** `https://your-backend.railway.app/docs`

## ✨ Features

- **🔐 Authentication** — JWT-based signup/login with bcrypt password hashing
- **👥 Role-Based Access Control** — Admin and Member roles with granular permissions
- **📁 Project Management** — Create, edit, delete projects with team collaboration
- **✅ Task Management** — Full CRUD with status tracking (To Do → In Progress → Done → Archived)
- **👤 Team Management** — Add/remove members, assign roles
- **📊 Dashboard** — Personal stats, recent tasks, overdue alerts
- **📱 Responsive Design** — Works on desktop and mobile

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | FastAPI, SQLAlchemy, SQLite/PostgreSQL |
| Auth | JWT (python-jose), bcrypt (passlib) |
| Frontend | React 18, Redux Toolkit, Vite |
| API Client | Axios |
| Deployment | Railway (backend) + Vercel (frontend) |

## 📂 Project Structure

```
team-task-manager/
├── backend/
│   ├── main.py              # FastAPI application
│   ├── database.py          # SQLAlchemy config
│   ├── models.py            # ORM models
│   ├── schemas.py           # Pydantic schemas
│   ├── requirements.txt
│   ├── .env.example
│   ├── auth/
│   │   ├── jwt_handler.py   # JWT tokens
│   │   └── password.py      # bcrypt hashing
│   └── routers/
│       ├── auth.py          # /api/auth/*
│       ├── projects.py      # /api/projects/*
│       ├── tasks.py         # /api/tasks/*
│       └── dashboard.py     # /api/dashboard
│
├── frontend/
│   ├── package.json
│   ├── vite.config.js
│   └── src/
│       ├── app/store.js
│       ├── features/        # Redux slices
│       ├── components/      # React components
│       ├── pages/
│       └── utils/
│
├── README.md
└── vercel.json
```

## 🏃 Quick Start

### Prerequisites
- Python 3.11+
- Node.js 18+

### Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate   # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Configure environment
cp .env.example .env
# Edit .env and set SECRET_KEY to a random string

# Run the server
uvicorn main:app --reload --port 8000
```

API docs available at: http://localhost:8000/docs

### Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Configure environment (optional — defaults to proxy via Vite)
cp .env.example .env.local
# Set VITE_API_URL=http://localhost:8000 if not using Vite proxy

# Run the dev server
npm run dev
```

App available at: http://localhost:5173

## 🔑 Environment Variables

### Backend (`backend/.env`)

| Variable | Description | Default |
|----------|-------------|---------|
| `SECRET_KEY` | JWT signing key (change in production!) | — |
| `ALGORITHM` | JWT algorithm | `HS256` |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | Token expiry | `30` |
| `DATABASE_URL` | SQLAlchemy DB URL | `sqlite:///./taskmanager.db` |
| `CORS_ORIGINS` | Comma-separated allowed origins | `http://localhost:5173` |

### Frontend (`frontend/.env.local`)

| Variable | Description |
|----------|-------------|
| `VITE_API_URL` | Backend API base URL (leave empty for Vite proxy in dev) |

## 📡 API Reference

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/signup` | Register new user |
| POST | `/api/auth/login` | Login, returns JWT |
| GET | `/api/auth/me` | Get current user |
| POST | `/api/auth/logout` | Logout |

### Projects
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/projects` | List user's projects |
| POST | `/api/projects` | Create project |
| GET | `/api/projects/{id}` | Get project details |
| PUT | `/api/projects/{id}` | Update project (admin) |
| DELETE | `/api/projects/{id}` | Delete project (admin) |
| GET | `/api/projects/{id}/members` | List members |
| POST | `/api/projects/{id}/members` | Add member (admin) |
| PUT | `/api/projects/{id}/members/{user_id}` | Update role (admin) |
| DELETE | `/api/projects/{id}/members/{user_id}` | Remove member (admin) |

### Tasks
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/tasks` | List tasks (filterable) |
| POST | `/api/tasks` | Create task |
| GET | `/api/tasks/{id}` | Get task |
| PUT | `/api/tasks/{id}` | Update task |
| DELETE | `/api/tasks/{id}` | Delete task |

### Dashboard
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/dashboard` | User dashboard data |

## 🗄️ Database Schema

```
Users          Projects         ProjectMembers      Tasks
─────          ────────         ──────────────      ─────
id             id               id                  id
email          name             project_id ──┐      project_id
password_hash  description      user_id   ──┐│      title
full_name      owner_id         role        ││      description
role           created_at       joined_at   ││      assigned_to
created_at     updated_at                   ││      status
updated_at                                  ││      due_date
                                            ││      created_by
                                            ││      created_at
                                            ││      updated_at
```

## 🚢 Deployment

### Backend → Railway

1. Create account at [railway.app](https://railway.app)
2. New Project → Deploy from GitHub repo → select `backend/` directory
3. Add environment variables:
   - `SECRET_KEY` = (generate with `python -c "import secrets; print(secrets.token_hex(32))"`)
   - `DATABASE_URL` = (use Railway PostgreSQL plugin, or leave as SQLite)
   - `CORS_ORIGINS` = `https://your-app.vercel.app`
4. Railway auto-detects Python and runs `uvicorn main:app --host 0.0.0.0 --port $PORT`

### Frontend → Vercel

1. Create account at [vercel.com](https://vercel.com)
2. Import GitHub repo → select `frontend/` as root directory
3. Framework preset: **Vite**
4. Add environment variable:
   - `VITE_API_URL` = `https://your-backend.railway.app`
5. Deploy!

## 🔒 Security

- Passwords hashed with bcrypt (salt rounds: 12)
- JWT tokens expire in 30 minutes
- All sensitive routes require `Authorization: Bearer <token>` header
- CORS restricted to configured origins
- Input validation on all endpoints (Pydantic)
- Role checks on every admin-only operation

## 👥 Roles

| Permission | Member | Admin |
|------------|--------|-------|
| View projects | ✅ | ✅ |
| Create project | ✅ | ✅ |
| Edit/delete project | ❌ | ✅ |
| Create/edit tasks | ✅ | ✅ |
| Delete own tasks | ✅ | ✅ |
| Delete any task | ❌ | ✅ |
| Add/remove members | ❌ | ✅ |
| Change member roles | ❌ | ✅ |

## 📝 License

MIT
