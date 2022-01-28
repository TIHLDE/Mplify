from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session

from models.common import Message
from models.register import Register
from models.login import LoginRegister, Login
from database import get_session
from utils.hash import generate_hash


router = APIRouter(
    prefix="/register",
    tags=["register"]
)


@router.post("/", response_model=Message)
async def register(
    *,
    session: Session = Depends(get_session),
    register: Register
):

    user = session.get(Login, register.username)
    if user:
        raise HTTPException(status_code=409, detail="User already exist")

    hash = generate_hash(register.password)
    newLogin = LoginRegister(
        username=register.username,
        hash=hash
    )

    db_user = Login.from_orm(newLogin)

    session.add(db_user)
    session.commit()
    session.refresh(db_user)

    return {"message": "ok"}
