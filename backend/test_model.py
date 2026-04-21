import os
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()
api_key = os.getenv("GEMINI_API_KEY")
genai.configure(api_key=api_key)

model_name = "gemini-2.5-flash"
print(f"Testing model: {model_name}")
try:
    model = genai.GenerativeModel(model_name=model_name)
    response = model.generate_content("Hello")
    print(f"Response: {response.text}")
except Exception as e:
    print(f"Error with {model_name}: {e}")

model_name_2 = "gemini-1.5-flash"
print(f"\nTesting model: {model_name_2}")
try:
    model = genai.GenerativeModel(model_name=model_name_2)
    response = model.generate_content("Hello")
    print(f"Response: {response.text}")
except Exception as e:
    print(f"Error with {model_name_2}: {e}")
