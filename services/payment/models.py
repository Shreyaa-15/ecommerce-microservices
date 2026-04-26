from sqlalchemy import Column, Integer, String, Float, DateTime
from sqlalchemy.sql import func
from database import Base

class Payment(Base):
    __tablename__ = "payments"
    id         = Column(Integer, primary_key=True, index=True)
    order_id   = Column(Integer, nullable=False, index=True)
    user_id    = Column(Integer, nullable=False)
    amount     = Column(Float, nullable=False)
    status     = Column(String, default="pending")  # pending, success, failed
    method     = Column(String, default="card")
    created_at = Column(DateTime(timezone=True), server_default=func.now())