import json
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from app.models import models
from app.schemas import schemas

# Location-based delivery days mapping
DELIVERY_DAYS_MAP = {
    "karachi": 1,
    "lahore": 2,
    "islamabad": 2,
    "rawalpindi": 2,
    "multan": 3,
    "faisalabad": 3,
    "peshawar": 3,
    "quetta": 4,
    "gilgit": 5,
    "default": 3
}

def get_delivery_days(location: str) -> int:
    """Get delivery days based on location."""
    if not location:
        return DELIVERY_DAYS_MAP["default"]
    
    location_lower = location.lower().strip()
    return DELIVERY_DAYS_MAP.get(location_lower, DELIVERY_DAYS_MAP["default"])

def calculate_delivery_date(location: str) -> datetime:
    """Calculate estimated delivery date."""
    days = get_delivery_days(location)
    return datetime.utcnow() + timedelta(days=days)

def create_order_from_confirmation(
    db: Session,
    user_id: int,
    product_id: int,
    quantity: int,
    location: str
) -> dict:
    """Create an order with items."""
    try:
        product = db.query(models.Product).filter(models.Product.id == product_id).first()
        if not product:
            return {"success": False, "error": "Product not found"}
        
        user = db.query(models.User).filter(models.User.id == user_id).first()
        if not user:
            return {"success": False, "error": "User not found"}
        
        # Update user location
        user.location = location
        
        # Calculate total amount
        total_amount = product.price * quantity
        delivery_date = calculate_delivery_date(location)
        
        # Create order
        order = models.Order(
            user_id=user_id,
            status="confirmed",
            payment_method="COD",
            amount=total_amount,
            location=location,
            delivery_date=delivery_date,
            notes=f"Order for {product.name} x{quantity}"
        )
        db.add(order)
        db.flush()
        
        # Create order item
        order_item = models.OrderItem(
            order_id=order.id,
            product_id=product_id,
            quantity=quantity,
            price=product.price
        )
        db.add(order_item)
        db.commit()
        db.refresh(order)
        
        delivery_days = get_delivery_days(location)
        
        return {
            "success": True,
            "order_id": order.id,
            "product_name": product.name,
            "quantity": quantity,
            "total_amount": total_amount,
            "location": location,
            "delivery_days": delivery_days,
            "delivery_date": delivery_date.strftime("%Y-%m-%d"),
            "payment_method": "COD"
        }
    except Exception as e:
        print(f"Error creating order: {e}")
        return {"success": False, "error": str(e)}

def get_order_by_user(db: Session, user_id: int, limit: int = 5) -> list:
    """Get user's recent orders."""
    orders = db.query(models.Order).filter(
        models.Order.user_id == user_id
    ).order_by(models.Order.created_at.desc()).limit(limit).all()
    
    result = []
    for order in orders:
        result.append({
            "order_id": order.id,
            "status": order.status,
            "amount": order.amount,
            "location": order.location,
            "delivery_date": order.delivery_date.strftime("%Y-%m-%d") if order.delivery_date else None,
            "created_at": order.created_at.strftime("%Y-%m-%d %H:%M"),
            "payment_method": order.payment_method
        })
    
    return result
