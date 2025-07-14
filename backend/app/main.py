# backend/app/main.py

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.routes import router as api_router
from app.database import engine, Base
# Import all models so SQLAlchemy knows about them and can create tables
# from app.models import finance, member, product, trainer # Existing models
from app.models import inventory # Existing inventory models
from app.models import feedback # ✅ NEW: Import feedback models so tables are created

# Create database tables
# Ensure all your Base models are imported here or via a single import that registers them
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="MIS GYMtrack API",
    description="API for Gym Management Information System (MIS GYMtrack)",
    version="1.0.0",
)

# Configure CORS
origins = [
    "http://localhost",
    "http://localhost:3000", # For your frontend development server
    "http://localhost:5173", # Common Vite/React dev server port
    # Add your Vercel frontend URL here when deployed
    # "https://your-vercel-app-name.vercel.app"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router, prefix="/api")

@app.get("/")
async def root():
    return {"message": "Welcome to MIS GYMtrack API"}