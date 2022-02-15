from fastapi import APIRouter

from api.v1.admin.api import router as apiRouter
from api.v1.admin.register import router as registerRouter

router = APIRouter(prefix="/admin", tags=["admin"])

router.include_router(registerRouter)
router.include_router(apiRouter)
