from fastapi import APIRouter
from app.routes import member
from app.routes import trainer
from app.routes import product  # ✅ Import product routes

router = APIRouter()

# Include existing routers
router.include_router(member.router)
router.include_router(trainer.router)

# ✅ Include product router - pastikan ini ada
router.include_router(product.router)

# Include test router if exists
try:
    from app.routes.test import router as test_router
    router.include_router(test_router, prefix="/test")
except ImportError:
    pass  # Test router optional
