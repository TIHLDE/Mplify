from fastapi import APIRouter

from api.v1.user.register import router as registerRouter
from api.v1.user.user import router as meRouter

router = APIRouter(prefix="/user", tags=["user"])

router.include_router(registerRouter)
router.include_router(meRouter)
