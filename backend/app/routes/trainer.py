# backend/app/routes/trainer.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.crud import trainer as crud_trainer
from app.schemas import trainer as schemas_trainer
from typing import List, Dict

router = APIRouter()

# Route yang lebih spesifik harus diletakkan DI ATAS route yang lebih umum
@router.get("/trainers/performance", response_model=schemas_trainer.TrainerDashboardData)
async def get_trainer_performance(db: Session = Depends(get_db)):
    dashboard_data = await crud_trainer.get_trainer_performance_data(db)
    return dashboard_data

@router.get("/trainers/{trainer_id}", response_model=schemas_trainer.Trainer)
def read_trainer(trainer_id: int, db: Session = Depends(get_db)):
    db_trainer = crud_trainer.get_trainer(db, trainer_id=trainer_id)
    if db_trainer is None:
        raise HTTPException(status_code=404, detail="Trainer not found")
    return db_trainer

@router.get("/trainers", response_model=List[schemas_trainer.Trainer])
def read_trainers(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    trainers = crud_trainer.get_trainers(db, skip=skip, limit=limit)
    return trainers

# --- Endpoint Baru untuk Trainer Detail Page ---

@router.get("/trainers/{trainer_id}/activity", response_model=List[schemas_trainer.TrainerActivityDataItem])
async def get_trainer_activity(trainer_id: int, db: Session = Depends(get_db)):
    """
    Mengambil data aktivitas pelatihan historis untuk trainer tertentu.
    """
    activity_data = await crud_trainer.get_trainer_activity_data(db, trainer_id)
    if not activity_data:
        # Bisa mengembalikan list kosong atau 404 jika tidak ada data sama sekali
        return [] # Atau raise HTTPException(status_code=404, detail="Activity data not found for trainer")
    return activity_data

@router.get("/trainers/{trainer_id}/schedule", response_model=Dict[str, List[schemas_trainer.TrainerScheduleClassItem]])
async def get_trainer_schedule(trainer_id: int, db: Session = Depends(get_db)):
    """
    Mengambil jadwal kelas untuk trainer tertentu, dikelompokkan berdasarkan hari.
    """
    schedule_data = await crud_trainer.get_trainer_schedule_data(db, trainer_id)
    if not schedule_data:
        # Mengembalikan dictionary kosong untuk setiap hari
        return {
            "Senin": [], "Selasa": [], "Rabu": [], "Kamis": [],
            "Jumat": [], "Sabtu": [], "Minggu": []
        }
    return schedule_data