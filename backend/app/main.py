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
    allow_origins=["*"],  # In production, specify the actual frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router)
