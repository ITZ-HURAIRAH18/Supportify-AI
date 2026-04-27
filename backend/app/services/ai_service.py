import os
from google import genai
import json
import re
import requests
from typing import Optional
from sqlalchemy.orm import Session
from dotenv import load_dotenv
from app.models import models

load_dotenv()

# API Base URL for internal service calls
API_BASE_URL = os.getenv("API_BASE_URL", "http://localhost:8000")

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

# ============================================================================
# API Helper Functions - Call internal APIs instead of direct DB access
# ============================================================================

def _get_user_data(user_id: int) -> Optional[dict]:
    """Fetch user data from API endpoint."""
    try:
        response = requests.get(f"{API_BASE_URL}/api/ai/user/{user_id}", timeout=5)
        if response.status_code == 200:
            return response.json()
    except Exception as e:
        print(f"[AI Service] Error fetching user data: {e}")
    return None


def _get_user_orders(user_id: int, limit: int = 3) -> list:
    """Fetch user orders from API endpoint."""
    try:
        response = requests.get(f"{API_BASE_URL}/api/ai/orders/{user_id}?limit={limit}", timeout=5)
        if response.status_code == 200:
            data = response.json()
            return data.get("orders", [])
    except Exception as e:
        print(f"[AI Service] Error fetching user orders: {e}")
    return []


def _get_products(limit: int = 15) -> list:
    """Fetch available products from API endpoint."""
    try:
        response = requests.get(f"{API_BASE_URL}/api/ai/products?limit={limit}", timeout=5)
        if response.status_code == 200:
            data = response.json()
            return data.get("products", [])
    except Exception as e:
        print(f"[AI Service] Error fetching products: {e}")
    return []


def _get_user_conversations(user_id: int, limit: int = 8) -> list:
    """Fetch user conversation history from API endpoint."""
    try:
        response = requests.get(f"{API_BASE_URL}/api/ai/conversations/{user_id}?limit={limit}", timeout=5)
        if response.status_code == 200:
            data = response.json()
            return data.get("conversations", [])
    except Exception as e:
        print(f"[AI Service] Error fetching conversations: {e}")
    return []

GREETING_PATTERN = re.compile(r"^(hi|hello|hey|hii|hello there|good (morning|afternoon|evening))\b[.!?\s]*$", re.IGNORECASE)
ORDER_INTENT_PATTERN = re.compile(r"\b(order|buy|purchase|chahiye|chahta|confirm)\b", re.IGNORECASE)
QUANTITY_PATTERN = re.compile(r"\b(\d{1,3})\b")

KNOWN_CITIES = {
    "karachi",
    "lahore",
    "islamabad",
    "rawalpindi",
    "multan",
    "faisalabad",
    "peshawar",
    "quetta",
    "gilgit",
}


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


def _extract_quantity(text: str) -> Optional[int]:
    match = QUANTITY_PATTERN.search(text or "")
    if not match:
        return None
    try:
        quantity = int(match.group(1))
    except ValueError:
        return None
    if quantity <= 0:
        return None
    return quantity


def _extract_location(text: str) -> Optional[str]:
    normalized = (text or "").strip().lower()
    if not normalized:
        return None

    for city in KNOWN_CITIES:
        if city in normalized:
            return city.title()

    # If user sends a full address, treat it as delivery location.
    if any(keyword in normalized for keyword in ["street", "st", "road", "rd", "house", "sector", "block", "phase"]):
        return (text or "").strip()

    return None


def _extract_product_from_text(text: str, products: list[dict]) -> Optional[dict]:
    normalized = (text or "").strip().lower()
    if not normalized:
        return None

    for product in products:
        name = (product.get("name") or "").strip().lower()
        if name and name in normalized:
            return product

    return None


def _build_order_context(user_id: int, current_message: str, products: list[dict], user_location: Optional[str]) -> dict:
    context = {
        "product": None,
        "quantity": None,
        "location": user_location,
    }

    # Get conversation history from API
    conversations = _get_user_conversations(user_id, limit=8)
    texts = [c.get("message", "") for c in conversations if c.get("message")]
    texts.append(current_message or "")

    for text in texts:
        product = _extract_product_from_text(text, products)
        qty = _extract_quantity(text)
        location = _extract_location(text)

        if product:
            context["product"] = product
        if qty:
            context["quantity"] = qty
        if location:
            context["location"] = location

    return context


def _deterministic_order_response(user_id: int, user_name: str, message: str, products: list[dict], user_location: Optional[str]) -> Optional[dict]:
    normalized = (message or "").strip().lower()
    if not normalized:
        return None

    product_mentioned = _extract_product_from_text(normalized, products) is not None
    qty_mentioned = _extract_quantity(normalized) is not None
    location_mentioned = _extract_location(message) is not None
    order_like = bool(ORDER_INTENT_PATTERN.search(normalized)) or product_mentioned or qty_mentioned or location_mentioned

    # Ignore if it looks like a general product inquiry
    if any(word in normalized for word in ["list", "catalog", "show", "available", "products", "price"]):
        return None

    # Ignore if it's an order history/tracking query
    if any(phrase in normalized for phrase in ["my order", "order status", "where is my", "delivery", "track", "history", "previous", "give me"]):
        return None

    if not order_like:
        return None

    context = _build_order_context(user_id, message, products, user_location)
    product = context["product"]
    quantity = context["quantity"]
    location = context["location"]

    first_name = (user_name or "there").split(" ")[0]

    if not product:
        return {
            "intent": "place_order",
            "response": f"Sure {first_name}, which product would you like to order?",
            "action": "ask_product",
            "product_id": None,
            "quantity": None,
            "location": location,
        }

    if not quantity:
        return {
            "intent": "place_order",
            "response": f"Great choice! How many {product.get('name')} would you like?",
            "action": "ask_quantity",
            "product_id": product.get("id"),
            "quantity": None,
            "location": location,
        }

    if not location:
        return {
            "intent": "place_order",
            "response": f"Perfect. You want {quantity} {product.get('name')}. Please share your delivery city/address.",
            "action": "ask_location",
            "product_id": product.get("id"),
            "quantity": quantity,
            "location": None,
        }

    total_amount = product.get("price", 0) * quantity
    return {
        "intent": "place_order",
        "response": (
            f"Excellent! Confirming your order: {quantity} x {product.get('name')}. "
            f"Total: ${total_amount:.2f}. Delivery location: {location}."
        ),
        "action": "confirm_order",
        "product_id": product.get("id"),
        "quantity": quantity,
        "location": location,
    }


def _generate_with_fallback(prompt: str):
    model_candidates = [
        os.getenv("GEMINI_MODEL", "gemini-2.5-flash"),
        "gemini-2.0-flash",
        "gemini-2.0-flash-lite",
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


def _format_products(products: list[dict]) -> str:
    if not products:
        return "I don't have products configured yet."

    lines = ["Here are our available products:"]
    for product in products[:10]:
        lines.append(f"- {product.get('name')}: ${product.get('price')}")
    lines.append("Tell me which product and quantity you want to order.")
    return "\n".join(lines)


def _rule_based_fallback(message: str, products: list[dict], recent_orders: list[dict]) -> dict:
    text = (message or "").strip().lower()

    if any(word in text for word in ["product", "products", "price", "list", "catalog"]):
        return {
            "intent": "product_inquiry",
            "response": _format_products(products),
            "action": "none",
            "product_id": None,
            "quantity": None,
            "location": None,
        }

    if any(phrase in text for phrase in ["order status", "my order", "where is my order", "delivery", "track"]):
        if not recent_orders:
            reply = "I couldn't find any recent orders for you yet. If you want, I can help you place one now."
        else:
            latest = recent_orders[0]
            eta = latest.get("delivery_date") or "not available"
            reply = f"Your latest order #{latest.get('id')} is '{latest.get('status')}'. Estimated delivery: {eta}."
        return {
            "intent": "order_tracking",
            "response": reply,
            "action": "none",
            "product_id": None,
            "quantity": None,
            "location": None,
        }

    if any(word in text for word in ["buy", "order", "confirm"]):
        return {
            "intent": "place_order",
            "response": "Sure, I can help with that. Please share the product name, quantity, and your city for delivery.",
            "action": "ask_product",
            "product_id": None,
            "quantity": None,
            "location": None,
        }

    if any(word in text for word in ["complain", "issue", "problem", "bad", "late"]):
        return {
            "intent": "complaint",
            "response": "I'm really sorry about that. Please share your order ID and what went wrong, and I'll help resolve it quickly.",
            "action": "none",
            "product_id": None,
            "quantity": None,
            "location": None,
        }

    return {
        "intent": "general",
        "response": "I'm here to help. You can ask for product list, prices, order status, or place a new order.",
        "action": "none",
        "product_id": None,
        "quantity": None,
        "location": None,
    }

def process_message(db: Session, user_id: int, message: str) -> dict:
    try:
        # Fetch user data from API instead of direct DB access
        user = _get_user_data(user_id)
        if not user:
            return {
                "response": "I'm sorry, I couldn't find your user account.",
                "intent": "general"
            }

        if _is_greeting(message):
            first_name = (user.get("name") or "").strip().split(" ")[0] if user.get("name") else "there"
            return {
                "intent": "general",
                "response": f"Hello {first_name}! 👋 How can I assist you today? You can ask about products, check your orders, or place a new order."
            }

        # Gather context from API endpoints
        orders_data = _get_user_orders(user_id, limit=3)
        products_data = _get_products(limit=15)

        # Check for deterministic responses (ordering flow)
        # But only if it's NOT a greeting or a general product inquiry
        if not _is_greeting(message) and not any(word in message.lower() for word in ["list", "catalog", "show", "available", "products", "price"]):
            deterministic_order = _deterministic_order_response(user_id, user.get("name"), message, products_data, user.get("location"))
            if deterministic_order is not None:
                return deterministic_order

        prompt = f"""
You are a God-level Customer Support AI Assistant. You are friendly, natural, and helpful like talking to a real person.
Your goal is to help customers with products, orders, and support.

Current Context:
- User: {user.get('name')}
- Location: {user.get('location') or "Not provided yet"}
- Recent Orders: {json.dumps(orders_data[:2])}
- Available Products: {json.dumps(products_data)}

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
4. If user already provided product + quantity + location in current/recent context, set action='confirm_order'
5. End with: "✅ Your order is confirmed! Payment method: COD (Cash on Delivery)"

Be conversational and natural. Use emojis occasionally. Keep responses concise but helpful.

IMPORTANT RULES:
- If user asks for "my orders", "order status", "track", "delivery", "previous orders" → intent="order_tracking", action="none"
- Only set action="confirm_order" if user EXPLICITLY mentions a product AND quantity AND location in recent context
- If user says "give me orders" but hasn't placed an order yet, suggest placing one instead
- Do NOT create a new order unless user clearly wants to place one

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
            return _rule_based_fallback(message, products_data, orders_data)

        try:
            response = _generate_with_fallback(prompt)
            result = _extract_json_payload(getattr(response, "text", ""))
        except Exception as model_error:
            print(f"[AI Service] Using rule fallback due to model error: {model_error}")
            return _rule_based_fallback(message, products_data, orders_data)
        
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
        # Last-resort fallback without DB context if any unexpected error happens.
        return {
            "intent": "general",
            "response": "I can still help with product list, order tracking, and placing new orders. Tell me what you need.",
            "action": "none",
            "product_id": None,
            "quantity": None,
            "location": None,
        }
