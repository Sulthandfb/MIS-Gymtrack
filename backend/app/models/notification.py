from sqlalchemy import Column, Integer, String, DateTime
from app.database import Base

class NotificationLog(Base):
    __tablename__ = "notification_log"

    id = Column(Integer, primary_key=True, index=True)
    type = Column(String)
    responded = Column(Integer)
    ignored = Column(Integer)
    timestamp = Column(DateTime)
