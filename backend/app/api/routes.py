from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.db.database import get_db
from app.models import models
from app.schemas import schemas
from app.services.ai_service import process_message
from app.services.order_service import create_order_from_confirmation, get_order_by_user

router = APIRouter()

@router.get("/health")
def health_check():
    return {"status": "healthy"}

@router.post("/message", response_model=schemas.ConversationResponse)
def handle_message(request: schemas.MessageRequest, db: Session = Depends(get_db)):
    ai_result = process_message(db, request.user_id, request.message)
    
    new_conversation = models.Conversation(
        user_id=request.user_id,
        message=request.message,
        response=ai_result["response"],
        intent=ai_result["intent"]
    )
    db.add(new_conversation)
    db.commit()
    db.refresh(new_conversation)
    
    return new_conversation

@router.post("/webhook/message", response_model=schemas.TelegramWebhookResponse)
def handle_webhook_message(request: schemas.TelegramWebhookRequest, db: Session = Depends(get_db)):
    """Telegram webhook endpoint - handles Telegram user IDs and returns reply format for n8n."""
    if not request.message:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Webhook payload must include a message text field.",
        )

    if not request.user_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Webhook payload must include a user identifier.",
        )

    print(f"[Webhook] Received message from user_id: {request.user_id}, chat_id: {request.chat_id}, username: {request.username}, message: {request.message}")
    telegram_id = request.user_id
    chat_id = request.chat_id
    username = (request.username or "").strip()
    first_name = (request.first_name or "").strip()
    last_name = (request.last_name or "").strip()

    telegram_display_name = username
    if not telegram_display_name:
        full_name = f"{first_name} {last_name}".strip()
        if full_name:
            telegram_display_name = full_name

    if not telegram_display_name:
        telegram_display_name = f"Telegram User {telegram_id}"

    placeholder_name = f"Telegram User {telegram_id}"

    # Look up user by telegram_id, or create a new one automatically
    user = db.query(models.User).filter(models.User.telegram_id == telegram_id).first()
    if not user:
        user = models.User(
            name=telegram_display_name,
            email=f"telegram_{telegram_id}@placeholder.local",
            telegram_id=telegram_id,
        )
        db.add(user)
        db.commit()
        db.refresh(user)
    elif telegram_display_name != placeholder_name and user.name != telegram_display_name:
        user.name = telegram_display_name
        db.commit()
        db.refresh(user)

    # Process through AI
    ai_result = process_message(db, user.id, request.message)
    
    # Handle order confirmation action
    final_reply = ai_result.get("response", "")
    
    if ai_result.get("action") == "confirm_order":
        product_id = ai_result.get("product_id")
        quantity = ai_result.get("quantity")
        location = ai_result.get("location")
        
        if product_id and quantity and location:
            order_result = create_order_from_confirmation(db, user.id, product_id, quantity, location)
            if order_result.get("success"):
                # Enhance reply with order details
                final_reply += f"\n\nOrder Confirmed!\n"
                final_reply += f"Order ID: #{order_result['order_id']}\n"
                final_reply += f"Product: {order_result['product_name']} x{order_result['quantity']}\n"
                final_reply += f"Total: Rs. {order_result['total_amount']}\n"
                final_reply += f"Location: {order_result['location']}\n"
                final_reply += f"Estimated Delivery: {order_result['delivery_days']} days ({order_result['delivery_date']})\n"
                final_reply += f"Payment: COD (Cash on Delivery)"

    # Save conversation
    new_conversation = models.Conversation(
        user_id=user.id,
        message=request.message,
        response=final_reply,
        intent=ai_result.get("intent", "general"),
    )
    db.add(new_conversation)
    db.commit()

    return schemas.TelegramWebhookResponse(
        reply=final_reply,
        intent=ai_result.get("intent", "general"),
        chat_id=chat_id
    )

@router.get("/conversations", response_model=List[schemas.ConversationResponse])
def get_conversations(skip: int = 0, limit: int = 100, user_id: int | None = None, db: Session = Depends(get_db)):
    query = db.query(models.Conversation)
    if user_id is not None:
        query = query.filter(models.Conversation.user_id == user_id)

    conversations = query.order_by(models.Conversation.timestamp.desc()).offset(skip).limit(limit).all()
    return conversations

@router.get("/users", response_model=List[schemas.UserResponse])
def get_users(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    users = db.query(models.User).offset(skip).limit(limit).all()
    return users

@router.post("/users", response_model=schemas.UserResponse)
def create_user(user: schemas.UserCreate, db: Session = Depends(get_db)):
    db_user = models.User(**user.dict())
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

@router.get("/products", response_model=List[schemas.ProductResponse])
def get_products(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    products = db.query(models.Product).offset(skip).limit(limit).all()
    return products

@router.post("/products", response_model=schemas.ProductResponse)
def create_product(product: schemas.ProductCreate, db: Session = Depends(get_db)):
    db_product = models.Product(**product.dict())
    db.add(db_product)
    db.commit()
    db.refresh(db_product)
    return db_product

@router.get("/orders", response_model=List[schemas.OrderResponse])
def get_orders(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    orders = db.query(models.Order).order_by(models.Order.created_at.desc()).offset(skip).limit(limit).all()
    return orders

@router.get("/orders/user/{user_id}")
def get_user_orders(user_id: int, limit: int = 10, db: Session = Depends(get_db)):
    """Get orders for a specific user - used by Telegram bot for order tracking."""
    orders = get_order_by_user(db, user_id, limit)
    if not orders:
        return {"orders": [], "message": "No orders found"}
    return {"orders": orders, "count": len(orders)}

@router.post("/orders", response_model=schemas.OrderResponse)
def create_order(order: schemas.OrderCreate, db: Session = Depends(get_db)):
    db_order = models.Order(**order.dict())
    db.add(db_order)
    db.commit()
    db.refresh(db_order)
    return db_order
