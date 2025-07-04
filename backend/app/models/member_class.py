# backend/app/models/member_class.py
from sqlalchemy import Column, Integer, String, Text, Numeric, ForeignKey, Date # Pastikan Date diimpor
from sqlalchemy.orm import relationship
from app.database import Base
from app.models.member import Member
from app.models.class_model import Class
from app.models.class_schedule import ClassSchedule

class MemberClass(Base):
    __tablename__ = "member_class"
    member_class_id = Column(Integer, primary_key=True, index=True)
    member_id = Column(Integer, ForeignKey("member.member_id"))
    class_id = Column(Integer, ForeignKey("class.class_id"))
    schedule_id = Column(Integer, ForeignKey("class_schedule.schedule_id"))
    attendance_date = Column(Date) # Tambahkan baris ini kembali
    attendance_status = Column(String)
    feedback = Column(Text)
    rating = Column(Numeric)

    member = relationship("Member", backref="classes_attended")
    class_obj = relationship("Class", backref="member_enrollments")
    schedule = relationship("ClassSchedule", backref="attendees")