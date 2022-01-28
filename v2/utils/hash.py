import bcrypt


def generate_hash(password: str) -> bytes:
    return bcrypt.hashpw(password.encode(), bcrypt.gensalt(12))


def check_hash(password: str, hashed_password: str) -> bool:
    return bcrypt.checkpw(password.encode(), hashed_password.encode())
