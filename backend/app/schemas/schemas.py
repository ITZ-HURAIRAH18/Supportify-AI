from pydantic import BaseModel
from pydantic import ConfigDict
from pydantic import model_validator
from typing import Any, Optional, List
from datetime import datetime

class UserBase(BaseModel):
    name: str
    phone: Optional[str] = None
    email: str
    location: Optional[str] = None

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

class OrderItemBase(BaseModel):
    product_id: int
    quantity: int
    price: float

class OrderItemCreate(OrderItemBase):
    pass

class OrderItemResponse(OrderItemBase):
    id: int
    order_id: int
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)

class OrderBase(BaseModel):
    status: str
    amount: float
    location: Optional[str] = None
    delivery_date: Optional[datetime] = None
    payment_method: str = "COD"
    notes: Optional[str] = None

class OrderCreate(OrderBase):
    user_id: int

class OrderResponse(OrderBase):
    id: int
    user_id: int
    created_at: datetime
    updated_at: datetime
    items: List[OrderItemResponse] = []
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
    user_id: Optional[str] = None
    message: Optional[str] = None
    chat_id: Optional[str] = None
    username: Optional[str] = None
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    model_config = ConfigDict(extra="allow")

    @model_validator(mode="before")
    @classmethod
    def normalize_telegram_payload(cls, data: Any):
        if not isinstance(data, dict):
            return data

        normalized = dict(data)

        nested_message = normalized.get("message")
        if isinstance(nested_message, dict):
            text = nested_message.get("text")
            if text is not None and not isinstance(text, dict):
                normalized["message"] = text

            nested_chat = nested_message.get("chat")
            if isinstance(nested_chat, dict) and normalized.get("chat_id") is None:
                chat_id = nested_chat.get("id")
                if chat_id is not None:
                    normalized["chat_id"] = str(chat_id)

            nested_from = nested_message.get("from")
            if isinstance(nested_from, dict) and normalized.get("user_id") is None:
                user_id = nested_from.get("id")
                if user_id is not None:
                    normalized["user_id"] = str(user_id)

            if isinstance(nested_from, dict):
                if normalized.get("username") is None and nested_from.get("username") is not None:
                    normalized["username"] = str(nested_from.get("username"))
                if normalized.get("first_name") is None and nested_from.get("first_name") is not None:
                    normalized["first_name"] = str(nested_from.get("first_name"))
                if normalized.get("last_name") is None and nested_from.get("last_name") is not None:
                    normalized["last_name"] = str(nested_from.get("last_name"))

        if normalized.get("message") is None:
            for key in ("text", "content", "body"):
                value = normalized.get(key)
                if isinstance(value, str) and value.strip():
                    normalized["message"] = value
                    break

        if normalized.get("user_id") is None:
            for key in ("from_id", "telegram_id", "sender_id"):
                value = normalized.get(key)
                if value is not None:
                    normalized["user_id"] = str(value)
                    break

        if normalized.get("chat_id") is None:
            for key in ("chat", "conversation_id"):
                value = normalized.get(key)
                if value is not None:
                    normalized["chat_id"] = str(value)
                    break

        if normalized.get("username") is None:
            for key in ("telegram_username", "user_name", "from_username"):
                value = normalized.get(key)
                if isinstance(value, str) and value.strip():
                    normalized["username"] = value.strip()
                    break

        if normalized.get("first_name") is None:
            for key in ("from_first_name", "given_name"):
                value = normalized.get(key)
                if isinstance(value, str) and value.strip():
                    normalized["first_name"] = value.strip()
                    break

        if normalized.get("last_name") is None:
            for key in ("from_last_name", "family_name"):
                value = normalized.get(key)
                if isinstance(value, str) and value.strip():
                    normalized["last_name"] = value.strip()
                    break

        return normalized

class TelegramWebhookResponse(BaseModel):
    reply: str
    intent: str
    chat_id: Optional[str] = None
