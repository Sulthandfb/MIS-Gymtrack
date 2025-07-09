from fastapi import APIRouter
from app.routes import member
from app.routes import trainer
from app.routes import product
from app.routes import finance  # ✅ pastikan ini ada

router = APIRouter()

# Include existing routers
router.include_router(member.router)
router.include_router(trainer.router)
router.include_router(product.router)
router.include_router(finance.router, prefix="/finance", tags=["Finance"])  # ✅ tambahkan ini

# Include test router if exists
try:
    from app.routes.test import router as test_router
    router.include_router(test_router, prefix="/test")
except ImportError:
    pass
