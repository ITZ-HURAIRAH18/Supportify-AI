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

GREETING_PATTERN = re.compile(r"^(hi|hello|hey|hii|hello there|good (morning|afternoon|evening))\b[.!?\s]*$", re.IGNORECASE)


def _is_greeting(message: str) -> bool:
    normalized_message = (message or "").strip().lower()
    if not normalized_message:
        return False

    return bool(GREETING_PATTERN.match(normalized_message))


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

        if _is_greeting(message):
            first_name = (user.name or "").strip().split(" ")[0] if user.name else "there"
            return {
                "intent": "general",
                "response": f"Hello {first_name}! 👋 How can I assist you today? You can ask about products, check your orders, or place a new order."
            }

        # Gather context
        recent_orders = db.query(models.Order).filter(models.Order.user_id == user_id).order_by(models.Order.created_at.desc()).limit(3).all()
        orders_context = [{"id": o.id, "status": o.status, "amount": o.amount, "location": o.location, "delivery_date": o.delivery_date.strftime("%Y-%m-%d") if o.delivery_date else None} for o in recent_orders]
        
        products = db.query(models.Product).limit(15).all()
        products_context = [{"id": p.id, "name": p.name, "price": p.price, "description": p.description} for p in products]

        prompt = f"""
You are a God-level Customer Support AI Assistant. You are friendly, natural, and helpful like talking to a real person.
Your goal is to help customers with products, orders, and support.

Current Context:
- User: {user.name}
- Location: {user.location or "Not provided yet"}
- Recent Orders: {json.dumps(orders_context[:2])}
- Available Products: {json.dumps(products_context)}

User Message: "{message}"

Detect the user's intent and respond naturally. Possible intents:
- "greeting": User says hello
- "product_inquiry": Asking about products, prices, or descriptions
- "order_inquiry": Asking about existing orders or order status
- "place_order": Wants to place a new order
- "order_tracking": Asking about delivery
- "complaint": Has an issue or complaint
- "general": General questions

If the user wants to place an order:
1. Ask which product they want (if not mentioned)
2. Ask quantity (if not mentioned)
3. Ask location for delivery
4. Confirm the order with total price, quantity, and estimated delivery days
5. End with: "✅ Your order is confirmed! Payment method: COD (Cash on Delivery)"

Be conversational and natural. Use emojis occasionally. Keep responses concise but helpful.

Return your response as JSON with exactly these keys:
{{
  "intent": "one of the intents above",
  "reply": "Your natural, conversational response",
  "action": "none|ask_product|ask_quantity|ask_location|confirm_order",
  "product_id": null or product_id if asking about/ordering,
  "quantity": null or quantity if asking about/ordering,
  "location": null or location if asking about/ordering
}}
"""

        if not client:
            return {
                "intent": "general",
                "response": "AI Service is not configured (missing API key)."
            }

        response = _generate_with_fallback(prompt)
        result = _extract_json_payload(getattr(response, "text", ""))
        
        intent = result.get("intent", "general")
        reply = result.get("reply", "I'm sorry, I couldn't understand that. Can you rephrase?")
        action = result.get("action", "none")
        product_id = result.get("product_id")
        quantity = result.get("quantity")
        location = result.get("location")

        return {
            "intent": intent,
            "response": reply,
            "action": action,
            "product_id": product_id,
            "quantity": quantity,
            "location": location
        }
    except Exception as e:
        print(f"Error in Gemini AI Service: {e}")
        return {
            "intent": "general",
            "response": "I'm currently experiencing technical difficulties. Please try again later."
        }
