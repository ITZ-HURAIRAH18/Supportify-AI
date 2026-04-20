# Supportify AI - Customer Support Automation System

A complete, production-ready AI Customer Support Automation System built with FastAPI, PostgreSQL, Gemini AI, React, and Tailwind CSS.

## Features
- **Backend**: FastAPI with Python 3.13, managed by `uv`.
- **Database**: PostgreSQL with SQLAlchemy ORM and Alembic for migrations.
- **AI Integration**: Google Gemini (gemini-1.5-flash) for classifying intent and generating smart replies based on database context (orders, products).
- **Frontend**: React Admin Dashboard powered by Vite and Tailwind CSS.
- **Integrations**: Supports `n8n` via webhook endpoints (`/webhook/message`).

---

## 1. Backend Setup

### Prerequisites
- Python 3.13+
- PostgreSQL server running locally or accessible remotely.
- `uv` installed (`pip install uv`).

### Installation
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Initialize and install dependencies:
   ```bash
   uv sync
   ```
   (Alternatively, the environment `.venv` is already set up if you ran `uv add` previously).

3. Setup your Environment Variables:
   Open `backend/.env` and configure your credentials:
   ```env
   DATABASE_URL=postgresql://postgres:postgres@localhost:5432/supportify
   GEMINI_API_KEY=your_gemini_api_key_here
   ```
   *Make sure you create a database named `supportify` in your PostgreSQL server.*

4. Run Database Migrations:
   ```bash
   uv run alembic upgrade head
   ```

5. Start the Server:
   ```bash
   uv run uvicorn app.main:app --reload --port 8000
   ```
   The API will be available at `http://localhost:8000`. You can view the interactive documentation at `http://localhost:8000/docs`.

---

## 2. Frontend Setup

### Prerequisites
- Node.js (v18+)
- npm

### Installation
1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the Development Server:
   ```bash
   npm run dev
   ```
   The dashboard will be available at `http://localhost:5173`.

---

## Architecture Overview

### Database Models
- `User`: Customers of your platform.
- `Product`: Products available for context during AI generation.
- `Order`: Order history for context.
- `Conversation`: History of messages and AI responses with intent classification.

### AI Processing
When a message hits the `/message` endpoint, the system:
1. Validates the user.
2. Pulls recent orders and product catalog from the database.
3. Constructs a context-rich prompt.
4. Calls the Gemini API to classify intent (`price_query`, `order_status`, `complaint`, `general`) and generate a smart reply.
5. Saves the conversation to the database.

### n8n Integration
You can point your n8n workflows to POST to `http://localhost:8000/webhook/message` with a JSON payload matching the `MessageRequest` schema (`user_id` and `message`). It shares the same logic as the standard `/message` endpoint.
