import os
from datetime import datetime, timedelta
from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from pydantic import BaseModel, EmailStr
from jose import JWTError, jwt
from passlib.context import CryptContext

from database import get_db, engine
import models

models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="Auth Service")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

SECRET_KEY = os.getenv("SECRET_KEY", "dev-secret-key")
ALGORITHM  = "HS256"
TOKEN_EXPIRE_HOURS = 24

pwd_ctx = CryptContext(schemes=["bcrypt"], deprecated="auto")

# --- Schemas ---
class RegisterRequest(BaseModel):
    email: str
    name:  str
    password: str

class LoginRequest(BaseModel):
    email: str
    password: str

class TokenResponse(BaseModel):
    access_token: str
    token_type:   str = "bearer"
    user_id:      int
    name:         str

# --- Helpers ---
def hash_password(pw: str) -> str:
    return pwd_ctx.hash(pw)

def verify_password(plain: str, hashed: str) -> bool:
    return pwd_ctx.verify(plain, hashed)

def create_token(user_id: int, email: str) -> str:
    payload = {
        "sub":  str(user_id),
        "email": email,
        "exp":  datetime.utcnow() + timedelta(hours=TOKEN_EXPIRE_HOURS)
    }
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)

def verify_token(token: str) -> dict:
    try:
        return jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")

# --- Routes ---
@app.post("/register", response_model=TokenResponse)
def register(req: RegisterRequest, db: Session = Depends(get_db)):
    if db.query(models.User).filter_by(email=req.email).first():
        raise HTTPException(status_code=400, detail="Email already registered")
    user = models.User(
        email=req.email,
        name=req.name,
        hashed_pw=hash_password(req.password)
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return TokenResponse(
        access_token=create_token(user.id, user.email),
        user_id=user.id,
        name=user.name
    )

@app.post("/login", response_model=TokenResponse)
def login(req: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(models.User).filter_by(email=req.email).first()
    if not user or not verify_password(req.password, user.hashed_pw):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    return TokenResponse(
        access_token=create_token(user.id, user.email),
        user_id=user.id,
        name=user.name
    )

@app.get("/verify")
def verify(token: str):
    payload = verify_token(token)
    return {"user_id": int(payload["sub"]), "email": payload["email"]}

@app.get("/health")
def health():
    return {"status": "ok", "service": "auth"}