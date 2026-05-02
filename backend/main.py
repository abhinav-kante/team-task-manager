from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os
from dotenv import load_dotenv

load_dotenv()

from database import engine, Base
import models  # noqa: F401 - needed to register models with SQLAlchemy

from routers import auth, projects, tasks, dashboard

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Team Task Manager API",
    description="A production-ready team task management system",
    version="1.0.0",
)

cors_origins_str = os.getenv("CORS_ORIGINS", "http://localhost:5173,http://localhost:3000")
cors_origins = [o.strip() for o in cors_origins_str.split(",")]

app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(projects.router)
app.include_router(tasks.router)
app.include_router(dashboard.router)


@app.get("/")
def root():
    return {"message": "Team Task Manager API", "version": "1.0.0", "docs": "/docs"}


@app.get("/health")
def health():
    return {"status": "healthy"}
