import os
import httpx
from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional

from database import engine, get_db, Base
from models import Order
from kafka_client import publish_event

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Order Service")
app.add_middleware(CORSMiddleware, allow_origins=["*"],
                   allow_methods=["*"], allow_headers=["*"])

PRODUCT_SERVICE_URL = os.getenv("PRODUCT_SERVICE_URL", "http://localhost:8002")


class OrderItem(BaseModel):
    product_id: int
    quantity:   int

class CreateOrderRequest(BaseModel):
    user_id: int
    items:   list[OrderItem]

class OrderResponse(BaseModel):
    id:      int
    user_id: int
    items:   list
    total:   float
    status:  str
    class Config:
        from_attributes = True


@app.post("/", response_model=OrderResponse, status_code=201)
async def create_order(req: CreateOrderRequest, db: Session = Depends(get_db)):
    """
    Create order — sync REST call to product service to validate + get prices,
    then publish order.created event to Kafka for payment service to consume.
    """
    order_items = []
    total = 0.0

    async with httpx.AsyncClient() as client:
        for item in req.items:
            try:
                r = await client.get(
                    f"{PRODUCT_SERVICE_URL}/{item.product_id}",
                    timeout=5.0
                )
                if r.status_code != 200:
                    raise HTTPException(
                        status_code=400,
                        detail=f"Product {item.product_id} not found"
                    )
                product = r.json()
                if product["stock"] < item.quantity:
                    raise HTTPException(
                        status_code=400,
                        detail=f"Insufficient stock for {product['name']}"
                    )
                line_total = product["price"] * item.quantity
                total += line_total
                order_items.append({
                    "product_id": item.product_id,
                    "name":       product["name"],
                    "price":      product["price"],
                    "quantity":   item.quantity,
                    "line_total": line_total
                })
            except httpx.RequestError:
                raise HTTPException(
                    status_code=503,
                    detail="Product service unavailable"
                )

    order = Order(
        user_id=req.user_id,
        items=order_items,
        total=round(total, 2),
        status="pending"
    )
    db.add(order)
    db.commit()
    db.refresh(order)

    # Publish event to Kafka — payment service will consume this
    publish_event("order.created", {
        "order_id": order.id,
        "user_id":  order.user_id,
        "total":    order.total,
        "items":    order_items
    })

    return order


@app.get("/user/{user_id}", response_model=list[OrderResponse])
def get_user_orders(user_id: int, db: Session = Depends(get_db)):
    return db.query(Order).filter(Order.user_id == user_id).all()


@app.get("/{order_id}", response_model=OrderResponse)
def get_order(order_id: int, db: Session = Depends(get_db)):
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    return order


@app.patch("/{order_id}/status")
def update_order_status(order_id: int, status: str,
                        db: Session = Depends(get_db)):
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    order.status = status
    db.commit()
    return {"order_id": order_id, "status": status}


@app.get("/health")
def health():
    return {"status": "ok", "service": "order"}