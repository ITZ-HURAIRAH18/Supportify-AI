# Supportify AI - A-Z Customer Support Automation System

Supportify AI is a premium, production-ready AI Customer Support platform. It uses **FastAPI**, **PostgreSQL**, **Gemini 2.5 Flash**, and **n8n** to automate customer interactions on Telegram with human-like intelligence.

---

## 📁 Project Structure

```text
Supportify AI/
├── backend/            # FastAPI Backend (AI Logic, Database, Webhooks)
│   ├── app/
│   │   ├── api/        # REST Endpoints
│   │   ├── models/     # DB Models (SQLAlchemy)
│   │   ├── schemas/    # Data Validation (Pydantic)
│   │   └── services/   # AI Logic (Gemini Service)
│   └── .venv/          # Python Virtual Environment
├── frontend/           # React Admin Dashboard (Vite + Tailwind CSS)
│   └── src/            # Components, Pages, and UI logic
├── n8n_workflow.json   # Exported n8n workflow source code
└── README.md           # This master documentation
```

---

## 🚀 1. Backend Setup (FastAPI)

The backend handles the AI processing, database storage, and Telegram webhook logic.

### Installation
1.  **Navigate to backend**: `cd backend`
2.  **Install dependencies**: `uv sync` (or `pip install -r requirements.txt`)
3.  **Environment Variables**: Create `backend/.env`:
    ```env
    DATABASE_URL=postgresql://user:pass@localhost:5432/supportify
    GEMINI_API_KEY=your_key_here
    GEMINI_MODEL=gemini-2.0-flash
    ```
4.  **Run Migrations**: `uv run alembic upgrade head`
5.  **Start Server**: `uv run uvicorn app.main:app --reload --port 8000`

---

## 💻 2. Frontend Setup (React Dashboard)

The frontend provides a premium dashboard to view conversations, orders, and user data.

### Installation
1.  **Navigate to frontend**: `cd frontend`
2.  **Install dependencies**: `npm install`
3.  **Start Dev Server**: `npm run dev` (Runs on `http://localhost:5173`)

---

## 🤖 3. n8n Automation (Telegram Integration)

n8n acts as the "bridge" between Telegram and your AI Backend.

### Running n8n with ngrok (Windows)
To receive messages from Telegram, you must expose n8n to the internet:

1.  **Start ngrok**: `ngrok http 5678`
2.  **Copy the URL** (e.g., `https://xxxx.ngrok-free.dev`).
3.  **Start n8n** with that URL:
    ```powershell
    $env:WEBHOOK_URL = "https://your-ngrok-url.ngrok-free.dev"
    n8n start
    ```
4.  **Import Workflow**:
    *   Open n8n at `http://127.0.0.1:5678`.
    *   Go to **Workflows > Import from File**.
    *   Select the `n8n_workflow.json` file in the root of this project.
5.  **Activate**: Click the **"Active"** toggle in the top right.

---

## 🛠️ 4. How to Use & Test

### Testing the Bot
1.  Open your Telegram Bot.
2.  Send `/start` or `hi`. The bot will greet you by your **Telegram Name**.
3.  Ask for products: `give me product list`.
4.  Place an order: `I want to order 5 Mangoes`.
5.  Confirm location: `Deliver to Faisalabad, Street 3`.

### Monitoring
*   **Database**: All users and conversations are stored in the `users` and `conversations` tables.
*   **Dashboard**: Open `http://localhost:5173` to see real-time analytics and order history.

---

## ☁️ 5. Deployment (Vercel)

1.  **Backend**: Push the `backend` folder to Vercel (FastAPI template).
2.  **Frontend**: Push the `frontend` folder to Vercel (Vite template).
3.  **Webhook**: Update your n8n `HTTP Request` node to point to your `https://your-app.vercel.app/webhook/message` URL.

---

## 💎 Features Included
*   ✅ **Auto-Username Detection**: Greets users by their Telegram names automatically.
*   ✅ **Smart Order Flow**: Detects products, quantities, and locations.
*   ✅ **Fallbacks**: If the AI is busy, the bot uses deterministic rule-based replies.
*   ✅ **Persistent Context**: Remembers the last 8 messages for better conversation flow.
