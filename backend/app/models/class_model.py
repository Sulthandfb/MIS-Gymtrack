# backend/app/models/class_model.py
from sqlalchemy import Column, Integer, String, Text, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base

class Class(Base):
    __tablename__ = "class"
    class_id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    description = Column(Text)
    difficulty_level = Column(String)
    trainer_id = Column(Integer, ForeignKey("trainer.trainer_id"))
    max_capacity = Column(Integer)
    location = Column(String)  # ✅ Tambahkan di sini

    trainer = relationship("Trainer", backref="classes_taught")