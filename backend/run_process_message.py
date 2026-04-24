from app.services.ai_service import process_message
from app.db.database import SessionLocal
from app.models.models import User

db = SessionLocal()
try:
    user = db.query(User).first()
    if not user:
        user = User(full_name="Test User", email="test@example.com", hashed_password="pwd")
        db.add(user)
        db.commit()
        db.refresh(user)
    
    print(f"Executing process_message for user {user.id}...")
    result = process_message(db, user.id, "Hello")
    print(f"Result: {result}")
except Exception as e:
    print(f"Error occurred: {e}")
finally:
    db.close()
