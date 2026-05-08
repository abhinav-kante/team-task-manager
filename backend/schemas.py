from pydantic import BaseModel, EmailStr, field_validator
from typing import Optional, List
from datetime import datetime
from enum import Enum


class UserRole(str, Enum):
    admin = "Admin"
    member = "Member"


class TaskStatus(str, Enum):
    todo = "To Do"
    in_progress = "In Progress"
    done = "Done"
    archived = "Archived"


# Auth schemas
class UserCreate(BaseModel):
    email: EmailStr
    password: str
    full_name: Optional[str] = None

    @field_validator("password")
    @classmethod
    def password_min_length(cls, v):
        if len(v) < 8:
            raise ValueError("Password must be at least 8 characters")
        return v


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserResponse(BaseModel):
    id: int
    email: str
    full_name: Optional[str]
    role: UserRole
    created_at: datetime

    model_config = {"from_attributes": True}


class Token(BaseModel):
    access_token: str
    token_type: str
    user: UserResponse


# Project schemas
class ProjectCreate(BaseModel):
    name: str
    description: Optional[str] = None

    @field_validator("name")
    @classmethod
    def name_not_empty(cls, v):
        if not v.strip():
            raise ValueError("Project name cannot be empty")
        return v.strip()


class ProjectUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None


class ProjectMemberResponse(BaseModel):
    id: int
    user_id: int
    project_id: int
    role: UserRole
    joined_at: datetime
    user: UserResponse

    model_config = {"from_attributes": True}


class ProjectResponse(BaseModel):
    id: int
    name: str
    description: Optional[str]
    owner_id: int
    created_at: datetime
    updated_at: Optional[datetime]
    owner: UserResponse
    members: List[ProjectMemberResponse] = []

    model_config = {"from_attributes": True}


# Member management schemas
class AddMemberRequest(BaseModel):
    user_id: int
    role: UserRole = UserRole.member


class UpdateMemberRole(BaseModel):
    role: UserRole


# Task schemas
class TaskCreate(BaseModel):
    title: str
    description: Optional[str] = None
    project_id: int
    assigned_to: Optional[int] = None
    due_date: Optional[datetime] = None
    status: TaskStatus = TaskStatus.todo

    @field_validator("title")
    @classmethod
    def title_not_empty(cls, v):
        if not v.strip():
            raise ValueError("Task title cannot be empty")
        return v.strip()


class TaskUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    assigned_to: Optional[int] = None
    status: Optional[TaskStatus] = None
    due_date: Optional[datetime] = None


class TaskResponse(BaseModel):
    id: int
    title: str
    description: Optional[str]
    project_id: int
    assigned_to: Optional[int]
    status: TaskStatus
    due_date: Optional[datetime]
    created_by: int
    created_at: datetime
    updated_at: Optional[datetime]
    assignee: Optional[UserResponse]
    creator: UserResponse

    model_config = {"from_attributes": True}


# Dashboard schemas
class DashboardStats(BaseModel):
    total_tasks: int
    todo_count: int
    in_progress_count: int
    done_count: int
    overdue_count: int
    total_projects: int


class DashboardResponse(BaseModel):
    stats: DashboardStats
    recent_tasks: List[TaskResponse]
    recent_projects: List[ProjectResponse]
    overdue_tasks: List[TaskResponse]
