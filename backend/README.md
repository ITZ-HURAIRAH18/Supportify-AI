# Supportify AI - Backend

This is the FastAPI backend for the Supportify AI project. It handles AI message processing, database management, and order automation.

## 🚀 Quick Start

1. **Install Dependencies**:
   ```bash
   pip install -r requirements.txt
   # or
   uv sync
   ```

2. **Environment Configuration**:
   Create a `.env` file with:
   ```env
   DATABASE_URL=postgresql://user:password@localhost:5432/supportify
   GEMINI_API_KEY=your_gemini_api_key
   GEMINI_MODEL=gemini-2.0-flash
   ```

3. **Database Migrations**:
   ```bash
   alembic upgrade head
   ```

4. **Run the Server**:
   ```bash
   uvicorn app.main:app --reload
   ```

## 🛠 Features
- **FastAPI**: High-performance REST API.
- **Gemini AI Integration**: Persistent 8-message context for natural conversations.
- **Order Service**: Automated order creation and delivery date calculation.
- **SQLAlchemy**: Robust ORM for PostgreSQL.
- **Alembic**: Version-controlled database migrations.

## 📡 API Endpoints
- `POST /webhook/message`: Handle incoming Telegram messages from n8n.
- `GET /api/stats`: Dashboard statistics.
- `GET /api/conversations`: Conversation history.
- `GET /api/orders`: Order management.
- `GET /api/products`: Product catalog.
