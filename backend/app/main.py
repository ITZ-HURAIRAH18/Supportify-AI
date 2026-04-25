from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.routes import router

app = FastAPI(
    title="Supportify AI API",
    description="Backend for AI Customer Support Automation System",
    version="1.0.0"
)

@app.middleware("http")
async def log_requests(request, call_next):
    print(f"[Server] Incoming {request.method} request to {request.url.path}")
    response = await call_next(request)
    return response

# Enable CORS for the React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",      # Local development
        "http://localhost:3000",      # Alternative local port
        "http://127.0.0.1:5173",      # Local IP
        "https://supportify-ai-gules.vercel.app",  # Vercel frontend
        "*"                           # Fallback for n8n and other services
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router)
