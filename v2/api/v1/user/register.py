from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select

from core.database import get_session
from models.admin import Admin, AdminCreate
from models.common import Message
from models.register import Register
from utils.oauth import get_password_hash

router = APIRouter(prefix="/register", tags=["register"])


@router.post("/", response_model=Message)
async def register(
    *, session: Session = Depends(get_session), register: Register
) -> Message | HTTPException:

    statement = select(Admin).where(Admin.username == register.username)
    results = session.exec(statement)
    admin = results.first()
    if admin:
        raise HTTPException(status_code=409, detail="Admin already exist")

    hashed_password = get_password_hash(register.password)
    new_admin = AdminCreate(
        username=register.username,
        hashed_password=hashed_password,
        email=register.email,
    )

    db_admin = Admin.from_orm(new_admin)

    session.add(db_admin)
    session.commit()
    session.refresh(db_admin)

    return Message(message="ok")
