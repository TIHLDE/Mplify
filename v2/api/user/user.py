from typing import List

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlmodel import Session, select

from database import get_session
from models.common import Message
from models.user import User, UserCreate, UserRead, UserUpdate

router = APIRouter(prefix="/user", tags=["user"])


@router.get("/", response_model=List[UserRead])
async def read_users(
    *,
    session: Session = Depends(get_session),
    offset: int = 0,
    limit: int = Query(default=100, lte=100),
) -> List[UserRead]:
    users = session.exec(select(User).offset(offset).limit(limit)).all()
    return users


@router.post("/", response_model=UserRead)
async def create_user(
    *, session: Session = Depends(get_session), user: UserCreate
) -> UserRead:

    db_user = User.from_orm(user)

    session.add(db_user)
    session.commit()
    session.refresh(db_user)

    return db_user


@router.get("/{user_id}", response_model=UserRead)
async def read_user(
    *, session: Session = Depends(get_session), user_id: int
) -> UserRead:
    user = session.get(User, user_id)

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    return user


@router.patch("/{user_id}", response_model=UserRead)
async def update_user(
    *, session: Session = Depends(get_session), user_id: int, user: UserUpdate
) -> UserRead:
    db_user = session.get(User, user_id)

    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")

    user_data = user.dict(exclude_unset=True)
    for key, value in user_data.items():
        setattr(db_user, key, value)

    session.add(db_user)
    session.commit()
    session.refresh(db_user)

    return db_user


@router.delete("/{user_id}", response_model=Message)
async def delete_user(
    *, session: Session = Depends(get_session), user_id: int
) -> Message:
    user = session.get(User, user_id)

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    session.delete(user)
    session.commit()

    return {"message": "ok"}
