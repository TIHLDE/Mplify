from typing import List

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlmodel import Session

# from api.v1.utils.admin import api_admin
from api.v1.utils.user import api_user
from core.database import get_session
from models.admin import Admin
from models.common import Message
from models.user import UserCreate, UserRead, UserUpdate
from utils.oauth import get_current_active_admin

router = APIRouter(prefix="/api/v1", tags=["api"])


@router.get("/users", response_model=List[UserRead])
async def read_users(
    *,
    session: Session = Depends(get_session),
    current_admin: Admin = Depends(get_current_active_admin),
    offset: int = 0,
    limit: int = Query(default=100, lte=100),
) -> List[UserRead] | HTTPException:
    if not current_admin:
        raise HTTPException(status_code=401, detail="Unauthorized")

    users = api_user.filter(session, offset, limit)
    return users


@router.post("/user", response_model=UserRead)
async def create_user(
    *,
    session: Session = Depends(get_session),
    current_admin: Admin = Depends(get_current_active_admin),
    user: UserCreate,
) -> UserRead | HTTPException:

    if not current_admin:
        raise HTTPException(status_code=401, detail="Unauthorized")

    user_exist = api_user.get_by_username(session, user.username)

    if user_exist:
        raise HTTPException(status_code=409, detail="User already exist")

    db_user = api_user.create_user(session, user)

    return db_user


@router.get("/user/{user_id}", response_model=UserRead)
async def read_user(
    *,
    session: Session = Depends(get_session),
    current_admin: Admin = Depends(get_current_active_admin),
    user_id: int,
) -> UserRead | HTTPException:

    if not current_admin:
        raise HTTPException(status_code=401, detail="Unauthorized")

    db_user = api_user.get_by_id(session, user_id)

    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")

    return db_user


@router.patch("/user/{user_id}", response_model=UserRead)
async def update_user(
    *,
    session: Session = Depends(get_session),
    current_admin: Admin = Depends(get_current_active_admin),
    user_id: int,
    user: UserUpdate,
) -> UserRead | HTTPException:
    if not current_admin:
        raise HTTPException(status_code=401, detail="Unauthorized")

    db_user = api_user.update_user(session, user_id, user)

    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")

    return db_user


@router.delete("/user/{user_id}", response_model=Message)
async def delete_user(
    *,
    session: Session = Depends(get_session),
    current_admin: Admin = Depends(get_current_active_admin),
    user_id: int,
) -> Message | HTTPException:
    if not current_admin:
        raise HTTPException(status_code=401, detail="Unauthorized")

    ok = api_user.delete_user(session, user_id)

    if not ok:
        raise HTTPException(status_code=404, detail="User not found")

    return Message(message="ok")
