import os
from google import genai
import json
import re
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


def _extract_json_payload(raw_text: str) -> dict:
    """Best-effort JSON parsing for model responses that may contain wrappers."""
    if not raw_text:
        return {}

    text = raw_text.strip()

    try:
        return json.loads(text)
    except json.JSONDecodeError:
        pass

    fenced_match = re.search(r"```(?:json)?\s*(\{.*?\})\s*```", text, flags=re.DOTALL)
    if fenced_match:
        try:
            return json.loads(fenced_match.group(1))
        except json.JSONDecodeError:
            pass

    object_match = re.search(r"(\{.*\})", text, flags=re.DOTALL)
    if object_match:
        try:
            return json.loads(object_match.group(1))
        except json.JSONDecodeError:
            pass

    return {}


def _generate_with_fallback(prompt: str):
    model_candidates = [
        os.getenv("GEMINI_MODEL", "gemini-2.5-flash"),
        "gemini-1.5-flash",
    ]

    seen = set()
    last_error = None

    for model_name in model_candidates:
        if not model_name or model_name in seen:
            continue
        seen.add(model_name)

        try:
            return client.models.generate_content(
                model=model_name,
                contents=prompt,
                config=generation_config,
            )
        except Exception as exc:
            last_error = exc
            print(f"[AI Service] Failed model '{model_name}': {exc}")

    if last_error:
        raise last_error

    raise RuntimeError("No Gemini models configured")

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

        response = _generate_with_fallback(prompt)
        result = _extract_json_payload(getattr(response, "text", ""))
        
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
