from fastapi import APIRouter
from app.routes import member
from app.routes import trainer # Tambahkan ini
from app.routes.test import router as test_router  # ✅ tambahkan

router = APIRouter()
router.include_router(member.router)
router.include_router(trainer.router) # Tambahkan ini
router.include_router(test_router, prefix="/test")  # ✅ tambahkan
