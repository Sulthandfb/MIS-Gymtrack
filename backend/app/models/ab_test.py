from sqlalchemy import Column, Integer, String
from app.database import Base

class ABTestLog(Base):
    __tablename__ = "ab_test_log"

    id = Column(Integer, primary_key=True, index=True)
    feature = Column(String)
    success = Column(Integer)
    total = Column(Integer)
