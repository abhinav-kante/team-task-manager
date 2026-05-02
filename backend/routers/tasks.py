from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session, joinedload
from typing import List, Optional
from datetime import datetime, timezone

import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from database import get_db
from models import Task, Project, ProjectMember, User, TaskStatus
from schemas import TaskCreate, TaskUpdate, TaskResponse
from routers.auth import get_current_user

router = APIRouter(prefix="/api/tasks", tags=["tasks"])


def get_task_with_relations(task_id: int, db: Session) -> Task:
    task = db.query(Task).options(
        joinedload(Task.assignee),
        joinedload(Task.creator)
    ).filter(Task.id == task_id).first()
    if not task:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Task not found")
    return task


def check_project_membership(project_id: int, user: User, db: Session) -> ProjectMember:
    member = db.query(ProjectMember).filter(
        ProjectMember.project_id == project_id,
        ProjectMember.user_id == user.id
    ).first()
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found")
    if project.owner_id != user.id and not member:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not a member of this project")
    return member


@router.get("", response_model=List[TaskResponse])
def list_tasks(
    project_id: Optional[int] = Query(None),
    status: Optional[str] = Query(None),
    assigned_to_me: Optional[bool] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    memberships = db.query(ProjectMember).filter(ProjectMember.user_id == current_user.id).all()
    member_project_ids = [m.project_id for m in memberships]
    owned_projects = db.query(Project).filter(Project.owner_id == current_user.id).all()
    owned_ids = [p.id for p in owned_projects]
    accessible_ids = list(set(member_project_ids + owned_ids))

    query = db.query(Task).options(
        joinedload(Task.assignee),
        joinedload(Task.creator)
    ).filter(Task.project_id.in_(accessible_ids))

    if project_id:
        query = query.filter(Task.project_id == project_id)
    if status:
        query = query.filter(Task.status == status)
    if assigned_to_me:
        query = query.filter(Task.assigned_to == current_user.id)

    return query.all()


@router.post("", response_model=TaskResponse, status_code=status.HTTP_201_CREATED)
def create_task(data: TaskCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    check_project_membership(data.project_id, current_user, db)
    
    if data.assigned_to:
        assignee_member = db.query(ProjectMember).filter(
            ProjectMember.project_id == data.project_id,
            ProjectMember.user_id == data.assigned_to
        ).first()
        assigned_project = db.query(Project).filter(Project.id == data.project_id, Project.owner_id == data.assigned_to).first()
        if not assignee_member and not assigned_project:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Assignee is not a project member")

    task = Task(
        title=data.title,
        description=data.description,
        project_id=data.project_id,
        assigned_to=data.assigned_to,
        status=data.status,
        due_date=data.due_date,
        created_by=current_user.id,
    )
    db.add(task)
    db.commit()
    db.refresh(task)
    return get_task_with_relations(task.id, db)


@router.get("/{task_id}", response_model=TaskResponse)
def get_task(task_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    task = get_task_with_relations(task_id, db)
    check_project_membership(task.project_id, current_user, db)
    return task


@router.put("/{task_id}", response_model=TaskResponse)
def update_task(task_id: int, data: TaskUpdate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    task = get_task_with_relations(task_id, db)
    check_project_membership(task.project_id, current_user, db)

    if data.title is not None:
        task.title = data.title
    if data.description is not None:
        task.description = data.description
    if data.assigned_to is not None:
        task.assigned_to = data.assigned_to
    if data.status is not None:
        task.status = data.status
    if data.due_date is not None:
        task.due_date = data.due_date

    db.commit()
    return get_task_with_relations(task_id, db)


@router.delete("/{task_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_task(task_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    task = get_task_with_relations(task_id, db)
    check_project_membership(task.project_id, current_user, db)
    
    member = db.query(ProjectMember).filter(
        ProjectMember.project_id == task.project_id,
        ProjectMember.user_id == current_user.id
    ).first()
    project = db.query(Project).filter(Project.id == task.project_id).first()
    is_admin = (project and project.owner_id == current_user.id) or (member and member.role == "Admin")
    
    if task.created_by != current_user.id and not is_admin:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Only the task creator or admin can delete this task")
    
    db.delete(task)
    db.commit()
