import os
from google import genai
import json
from sqlalchemy.orm import Session
from dotenv import load_dotenv
from app.models import models

load_dotenv()

# Configure Gemini
api_key = os.getenv("GEMINI_API_KEY")
print(f"[AI Service] Gemini API key loaded: {'Yes' if api_key else 'NO - MISSING!'}")

client = None
if api_key:
    client = genai.Client(api_key=api_key)

generation_config = {
  "temperature": 0.2,
  "top_p": 0.95,
  "top_k": 40,
  "max_output_tokens": 1024,
  "response_mime_type": "application/json",
}

def process_message(db: Session, user_id: int, message: str) -> dict:
    try:
        user = db.query(models.User).filter(models.User.id == user_id).first()
        if not user:
            return {
                "response": "I'm sorry, I couldn't find your user account.",
                "intent": "general"
            }

        # Gather context
        recent_orders = db.query(models.Order).filter(models.Order.user_id == user_id).order_by(models.Order.created_at.desc()).limit(3).all()
        orders_context = [{"id": o.id, "status": o.status, "amount": o.amount} for o in recent_orders]
        
        products = db.query(models.Product).limit(10).all()
        products_context = [{"name": p.name, "price": p.price, "description": p.description} for p in products]

        prompt = f"""
You are an AI Customer Support Assistant for an e-commerce platform.
Classify the user's message intent into one of these exact strings: 'price_query', 'order_status', 'complaint', 'general'.
Provide a helpful 'reply' to the user based on the context.

Context Data:
User Name: {user.name}
Recent Orders: {json.dumps(orders_context)}
Products: {json.dumps(products_context)}

User Message: "{message}"

Return your response strictly as a JSON object with two keys:
1. "intent": The classified intent.
2. "reply": Your smart, contextual reply.
"""

        if not client:
            return {
                "intent": "general",
                "response": "AI Service is not configured (missing API key)."
            }

        response = client.models.generate_content(
            model="gemini-1.5-flash",
            contents=prompt,
            config=generation_config
        )
        result = json.loads(response.text)
        
        intent = result.get("intent", "general")
        reply = result.get("reply", "I'm sorry, I couldn't understand that.")

        return {
            "intent": intent,
            "response": reply
        }
    except Exception as e:
        print(f"Error in Gemini AI Service: {e}")
        return {
            "intent": "general",
            "response": "I'm currently experiencing technical difficulties. Please try again later."
        }
