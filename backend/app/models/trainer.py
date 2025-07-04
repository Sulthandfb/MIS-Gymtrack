# backend/app/models/trainer.py
from sqlalchemy import Column, Integer, String, Numeric, Date, Text
from app.database import Base #

class Trainer(Base):
    __tablename__ = "trainer"
    trainer_id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    email = Column(String) # Tambahan
    phone = Column(String) # Tambahan
    birth_date = Column(Date) # Tambahan
    join_date = Column(Date) # Tambahan
    specialization = Column(String)
    certification = Column(String)
    hourly_rate = Column(Numeric)
    rating = Column(Numeric)
    status = Column(String) # Tambahan
    profile_image = Column(String) # Tambahan
    bio = Column(Text) # Tambahan