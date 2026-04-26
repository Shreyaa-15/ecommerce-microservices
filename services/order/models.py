from sqlalchemy import Column, Integer, String, Float, DateTime, JSON
from sqlalchemy.sql import func
from database import Base

class Order(Base):
    __tablename__ = "orders"
    id         = Column(Integer, primary_key=True, index=True)
    user_id    = Column(Integer, nullable=False, index=True)
    items      = Column(JSON, nullable=False)   # [{product_id, name, price, quantity}]
    total      = Column(Float, nullable=False)
    status     = Column(String, default="pending")  # pending, paid, cancelled, shipped
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())