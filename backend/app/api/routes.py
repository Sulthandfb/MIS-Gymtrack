# backend/app/api/routes.py

from fastapi import APIRouter
from app.routes import member
from app.routes import trainer
from app.routes import product
from app.routes import finance
from app.routes import inventory
from app.routes import feedback # ✅ NEW: Import the feedback router
from app.routes import chatbot # ✅ NEW: Import the feedback router

router = APIRouter()

# Include existing routers
router.include_router(member.router)
router.include_router(trainer.router)
router.include_router(product.router)
router.include_router(finance.router, prefix="/finance", tags=["Finance"])
router.include_router(inventory.router, prefix="/inventory", tags=["Inventory"])
router.include_router(feedback.router, prefix="/feedback", tags=["Feedback"]) # ✅ NEW: Include the feedback router
router.include_router(chatbot.router, prefix="/ai", tags=["chatbot"]) # ✅ NEW: Include the feedback router

# Include test router if exists
try:
    from app.routes.test import router as test_router
    router.include_router(test_router, prefix="/test")
except ImportError:
    pass