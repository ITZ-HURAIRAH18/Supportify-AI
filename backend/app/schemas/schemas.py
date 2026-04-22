from pydantic import BaseModel
from pydantic import ConfigDict
from typing import Optional, List
from datetime import datetime

class UserBase(BaseModel):
    name: str
    phone: Optional[str] = None
    email: str

class UserCreate(UserBase):
    pass

class UserResponse(UserBase):
    id: int
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)

class ConversationBase(BaseModel):
    message: str

class ConversationCreate(ConversationBase):
    user_id: int

class ConversationResponse(ConversationBase):
    id: int
    user_id: int
    response: str
    intent: str
    timestamp: datetime
    model_config = ConfigDict(from_attributes=True)

class OrderBase(BaseModel):
    status: str
    amount: float

class OrderCreate(OrderBase):
    user_id: int

class OrderResponse(OrderBase):
    id: int
    user_id: int
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)

class ProductBase(BaseModel):
    name: str
    price: float
    description: str

class ProductCreate(ProductBase):
    pass

class ProductResponse(ProductBase):
    id: int
    model_config = ConfigDict(from_attributes=True)

class MessageRequest(BaseModel):
    user_id: int
    message: str

class TelegramWebhookRequest(BaseModel):
    user_id: str
    message: str
    chat_id: Optional[str] = None

class TelegramWebhookResponse(BaseModel):
    reply: str
    intent: str
    chat_id: Optional[str] = None
