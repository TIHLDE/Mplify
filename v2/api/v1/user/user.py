from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session

from api.v1.utils.user import api_user
from core.database import get_session
from models.user import User, UserUpdate
from utils.oauth import get_current_active_user

router = APIRouter(prefix="/me", tags=["me"])


@router.get("/", response_model=User)
async def read_user_me(current_user: User = Depends(get_current_active_user)) -> User:
    return current_user


@router.patch("/", response_model=User)
async def update_user_me(
    *,
    current_user: User = Depends(get_current_active_user),
    session: Session = Depends(get_session),
    user: UserUpdate
) -> User | HTTPException:

    db_user = api_user.update(session, current_user.id, user)

    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")

    return db_user
