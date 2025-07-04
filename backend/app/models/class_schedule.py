# backend/app/models/class_schedule.py
from sqlalchemy import Column, Integer, Date, Time, String, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base #

class ClassSchedule(Base):
    __tablename__ = "class_schedule"
    schedule_id = Column(Integer, primary_key=True, index=True)
    class_id = Column(Integer, ForeignKey("class.class_id"))
    schedule_date = Column(Date)
    start_time = Column(Time)
    end_time = Column(Time)
    trainer_id = Column(Integer, ForeignKey("trainer.trainer_id"))
    status = Column(String) # Tambahkan kolom status jika ada di ERD atau diperlukan

    # Relationships
    class_obj = relationship("Class", backref="schedules") # backref untuk akses dari Class
    trainer = relationship("Trainer", backref="scheduled_classes") # backref untuk akses dari Trainer