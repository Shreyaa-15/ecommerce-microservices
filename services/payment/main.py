import random
from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from pydantic import BaseModel

from database import engine, get_db, Base, SessionLocal
from models import Payment
from kafka_client import publish_event, start_consumer

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Payment Service")
app.add_middleware(CORSMiddleware, allow_origins=["*"],
                   allow_methods=["*"], allow_headers=["*"])


class PaymentRequest(BaseModel):
    order_id: int
    user_id:  int
    amount:   float
    method:   str = "card"


def process_kafka_order(event: dict):
    """
    Consume order.created event from Kafka.
    Auto-process payment — 90% success rate simulation.
    Publishes payment.processed event back to Kafka.
    This implements the SAGA pattern for distributed transactions.
    """
    db = SessionLocal()
    try:
        existing = db.query(Payment).filter(
            Payment.order_id == event["order_id"]
        ).first()
        if existing:
            return  # already processed

        success = random.random() < 0.9
        payment = Payment(
            order_id=event["order_id"],
            user_id=event["user_id"],
            amount=event["total"],
            status="success" if success else "failed",
            method="card"
        )
        db.add(payment)
        db.commit()

        # Publish result — order service can react
        publish_event("payment.processed", {
            "order_id":   event["order_id"],
            "payment_id": payment.id,
            "status":     payment.status,
            "amount":     payment.amount
        })
    finally:
        db.close()


@app.on_event("startup")
def startup():
    start_consumer(process_kafka_order)


@app.post("/", status_code=201)
def create_payment(req: PaymentRequest, db: Session = Depends(get_db)):
    """Manual payment endpoint — for direct API calls."""
    success = random.random() < 0.9
    payment = Payment(
        order_id=req.order_id,
        user_id=req.user_id,
        amount=req.amount,
        status="success" if success else "failed",
        method=req.method
    )
    db.add(payment)
    db.commit()
    db.refresh(payment)

    publish_event("payment.processed", {
        "order_id":   payment.order_id,
        "payment_id": payment.id,
        "status":     payment.status,
        "amount":     payment.amount
    })
    return payment


@app.get("/order/{order_id}")
def get_payment_by_order(order_id: int, db: Session = Depends(get_db)):
    payment = db.query(Payment).filter(Payment.order_id == order_id).first()
    if not payment:
        raise HTTPException(status_code=404, detail="Payment not found")
    return payment


@app.get("/health")
def health():
    return {"status": "ok", "service": "payment"}