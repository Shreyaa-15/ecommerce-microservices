from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional

from database import engine, get_db, Base
from models import Product

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Product Service")
app.add_middleware(CORSMiddleware, allow_origins=["*"],
                   allow_methods=["*"], allow_headers=["*"])

SAMPLE_PRODUCTS = [
    {"name": "MacBook Pro 14\"",  "price": 1999.99, "stock": 50,  "category": "electronics",  "description": "Apple M3 chip, 16GB RAM", "image_url": "https://via.placeholder.com/300x200?text=MacBook"},
    {"name": "Sony WH-1000XM5",  "price": 349.99,  "stock": 120, "category": "electronics",  "description": "Noise cancelling headphones", "image_url": "https://via.placeholder.com/300x200?text=Sony+WH"},
    {"name": "Python Crash Course","price": 39.99,  "stock": 200, "category": "books",        "description": "Learn Python fast", "image_url": "https://via.placeholder.com/300x200?text=Python+Book"},
    {"name": "Nike Air Max 270",  "price": 129.99,  "stock": 80,  "category": "footwear",     "description": "Lightweight running shoes", "image_url": "https://via.placeholder.com/300x200?text=Nike"},
    {"name": "Kindle Paperwhite", "price": 139.99,  "stock": 90,  "category": "electronics",  "description": "6.8\" display, waterproof", "image_url": "https://via.placeholder.com/300x200?text=Kindle"},
    {"name": "Desk Lamp LED",     "price": 49.99,   "stock": 150, "category": "home",         "description": "Adjustable brightness", "image_url": "https://via.placeholder.com/300x200?text=Lamp"},
    {"name": "Yoga Mat Pro",      "price": 79.99,   "stock": 60,  "category": "fitness",      "description": "Non-slip, 6mm thick", "image_url": "https://via.placeholder.com/300x200?text=Yoga+Mat"},
    {"name": "Coffee Grinder",    "price": 89.99,   "stock": 40,  "category": "home",         "description": "Burr grinder, 12 settings", "image_url": "https://via.placeholder.com/300x200?text=Grinder"},
]

class ProductCreate(BaseModel):
    name:        str
    description: str = ""
    price:       float
    stock:       int = 0
    category:    str = "general"
    image_url:   str = ""

class ProductResponse(BaseModel):
    id:          int
    name:        str
    description: str
    price:       float
    stock:       int
    category:    str
    image_url:   str
    class Config:
        from_attributes = True

class StockUpdate(BaseModel):
    quantity: int


def seed_products(db: Session):
    if db.query(Product).count() == 0:
        for p in SAMPLE_PRODUCTS:
            db.add(Product(**p))
        db.commit()


@app.on_event("startup")
def startup():
    db = next(get_db())
    seed_products(db)


@app.get("/", response_model=list[ProductResponse])
def list_products(
    category: Optional[str] = None,
    db: Session = Depends(get_db)
):
    q = db.query(Product)
    if category:
        q = q.filter(Product.category == category)
    return q.all()


@app.get("/{product_id}", response_model=ProductResponse)
def get_product(product_id: int, db: Session = Depends(get_db)):
    p = db.query(Product).filter(Product.id == product_id).first()
    if not p:
        raise HTTPException(status_code=404, detail="Product not found")
    return p


@app.post("/", response_model=ProductResponse, status_code=201)
def create_product(req: ProductCreate, db: Session = Depends(get_db)):
    p = Product(**req.model_dump())
    db.add(p)
    db.commit()
    db.refresh(p)
    return p


@app.patch("/{product_id}/stock")
def update_stock(product_id: int, req: StockUpdate,
                 db: Session = Depends(get_db)):
    p = db.query(Product).filter(Product.id == product_id).first()
    if not p:
        raise HTTPException(status_code=404, detail="Product not found")
    p.stock = max(0, p.stock + req.quantity)
    db.commit()
    return {"product_id": product_id, "new_stock": p.stock}


@app.get("/health")
def health():
    return {"status": "ok", "service": "product"}