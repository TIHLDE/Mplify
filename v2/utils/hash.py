import bcrypt


def generate_hash(password: str) -> str:
    return bcrypt.hashpw(password.encode(), bcrypt.gensalt(12))


def check_hash(password: bytes, hashed_password: bytes) -> bool:
    return bcrypt.checkpw(password.encode(), hashed_password.encode())
