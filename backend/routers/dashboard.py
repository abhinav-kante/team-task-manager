from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session, joinedload
from datetime import datetime, timezone

import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from database import get_db
from models import Task, Project, ProjectMember, TaskStatus
from schemas import DashboardResponse, DashboardStats, TaskResponse, ProjectResponse
from routers.auth import get_current_user
from models import User

router = APIRouter(prefix="/api/dashboard", tags=["dashboard"])


@router.get("", response_model=DashboardResponse)
def get_dashboard(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    memberships = db.query(ProjectMember).filter(ProjectMember.user_id == current_user.id).all()
    member_project_ids = [m.project_id for m in memberships]
    owned_projects = db.query(Project).filter(Project.owner_id == current_user.id).all()
    owned_ids = [p.id for p in owned_projects]
    accessible_ids = list(set(member_project_ids + owned_ids))

    all_tasks = db.query(Task).options(
        joinedload(Task.assignee),
        joinedload(Task.creator)
    ).filter(
        Task.project_id.in_(accessible_ids),
        Task.assigned_to == current_user.id
    ).all()

    now = datetime.now(timezone.utc)
    todo_count = sum(1 for t in all_tasks if t.status == TaskStatus.todo)
    in_progress_count = sum(1 for t in all_tasks if t.status == TaskStatus.in_progress)
    done_count = sum(1 for t in all_tasks if t.status == TaskStatus.done)
    overdue_tasks = [
        t for t in all_tasks
        if t.due_date and t.due_date.replace(tzinfo=timezone.utc) < now
        and t.status not in (TaskStatus.done, TaskStatus.archived)
    ]

    recent_tasks = sorted(all_tasks, key=lambda t: t.created_at, reverse=True)[:10]

    recent_projects = db.query(Project).options(
        joinedload(Project.owner),
        joinedload(Project.members).joinedload(ProjectMember.user)
    ).filter(Project.id.in_(accessible_ids)).order_by(Project.created_at.desc()).limit(5).all()

    stats = DashboardStats(
        total_tasks=len(all_tasks),
        todo_count=todo_count,
        in_progress_count=in_progress_count,
        done_count=done_count,
        overdue_count=len(overdue_tasks),
        total_projects=len(accessible_ids),
    )

    return DashboardResponse(
        stats=stats,
        recent_tasks=[TaskResponse.model_validate(t) for t in recent_tasks],
        recent_projects=[ProjectResponse.model_validate(p) for p in recent_projects],
        overdue_tasks=[TaskResponse.model_validate(t) for t in overdue_tasks],
    )
