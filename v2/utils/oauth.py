from datetime import datetime, timedelta
from typing import Dict

from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from passlib.context import CryptContext
from sqlmodel import Session, select

from core.database import get_session
from core.settings import ALGORITHM, SECRET_KEY, TOKEN_URL
from models.admin import Admin, AdminInDB
from models.token import TokenData
from models.user import User, UserInDB

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl=TOKEN_URL)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)


def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)


def get_user(session: Session, username: str) -> User | None:
    statement = select(User).where(User.username == username)
    results = session.exec(statement)
    user = results.first()

    if user:
        return user

    return None


def get_admin(session: Session, username: str) -> Admin | None:
    statement = select(Admin).where(Admin.username == username)
    results = session.exec(statement)
    admin = results.first()

    if admin:
        return admin

    return None


def authenticate_user(
    session: Session, username: str, password: str
) -> UserInDB | AdminInDB | bool:

    user_or_admin = get_user(session, username)
    if not user_or_admin:
        user_or_admin = get_admin(session, username)
        if not user_or_admin:
            return False

    if not verify_password(password, user_or_admin.hashed_password):
        return False

    return user_or_admin


def create_access_token(data: dict, expires_delta: timedelta | None = None) -> Dict:
    to_encode = data.copy()

    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)

    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt


async def get_current_user(
    session: Session = Depends(get_session), token: str = Depends(oauth2_scheme)
) -> HTTPException | UserInDB:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )

    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")

        if username is None:
            raise credentials_exception

        token_data = TokenData(username=username)
    except JWTError:
        raise credentials_exception

    user = get_user(session, username=token_data.username)

    if user is None:
        raise credentials_exception

    return user


async def get_current_active_user(
    current_user: User = Depends(get_current_user),
) -> HTTPException | UserInDB:
    if current_user.disabled:
        raise HTTPException(status_code=400, detail="Inactive user")

    return current_user


async def get_current_admin(
    session: Session = Depends(get_session), token: str = Depends(oauth2_scheme)
) -> HTTPException | AdminInDB:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )

    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")

        if username is None:
            raise credentials_exception

        token_data = TokenData(username=username)
    except JWTError:
        raise credentials_exception

    user = get_admin(session, username=token_data.username)

    if user is None:
        raise credentials_exception

    return user


async def get_current_active_admin(
    current_admin: Admin = Depends(get_current_admin),
) -> HTTPException | AdminInDB:
    if current_admin.disabled:
        raise HTTPException(status_code=400, detail="Inactive user")

    return current_admin
