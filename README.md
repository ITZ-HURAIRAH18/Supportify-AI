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

## 3. n8n + ngrok Setup (Windows, Copy-Paste)

Use this when you want to run n8n editor locally at `http://127.0.0.1:5678` and only expose webhooks through ngrok.

### Step 1: Start ngrok tunnel
Open PowerShell window #1:

```powershell
ngrok http 5678
```

Copy your HTTPS forwarding URL (example: `https://your-subdomain.ngrok-free.dev`).

### Step 2: Start n8n with clean environment
Open PowerShell window #2 and run:

```powershell
# Stop any old n8n process using port 5678
$pid5678 = (Get-NetTCPConnection -LocalPort 5678 -State Listen -ErrorAction SilentlyContinue | Select-Object -First 1 -ExpandProperty OwningProcess)
if ($pid5678) { Stop-Process -Id $pid5678 -Force }

# Clear old values
$env:N8N_PATH = $null
$env:WEBHOOK_URL = $null
$env:N8N_EDITOR_BASE_URL = $null
$env:N8N_DIAGNOSTICS_ENABLED = $null

# Set new values (replace ngrok URL)
$env:WEBHOOK_URL = "https://your-subdomain.ngrok-free.dev"
$env:N8N_EDITOR_BASE_URL = "http://127.0.0.1:5678"
$env:N8N_HOST = "0.0.0.0"
$env:N8N_PORT = "5678"
$env:N8N_DIAGNOSTICS_ENABLED = "false"

# Start n8n
n8n start
```

Open editor at:

`http://127.0.0.1:5678`

### Step 3: Telegram workflow node setup
Use these nodes in this order:

1. `Telegram Trigger` (`message` updates)
2. `IF` node with condition: `={{ $json.message.text }}` is not empty
3. `HTTP Request` node to backend URL
4. `Telegram` send message node for success reply
5. Optional `Telegram` send message node for error path

`HTTP Request` node values:

- Method: `POST`
- URL: `https://supportify-ai-gules.vercel.app/webhook/message`
- Send Body: `true`
- Body Type: `JSON`
- JSON Body:

```js
={{ {
   user_id: String($('Telegram Trigger').item.json.message.from.id),
   message: $('Telegram Trigger').item.json.message.text,
   chat_id: String($('Telegram Trigger').item.json.message.chat.id)
} }}
```

Success Telegram node values:

- Chat ID: `={{ $('Telegram Trigger').item.json.message.chat.id }}`
- Text: `={{ $json.reply }}`

Important: attach the same `telegramApi` credential to all Telegram nodes (Trigger + Send nodes), then `Save` and `Publish` workflow.

### Step 4: Quick tests
Backend test:

```powershell
Invoke-RestMethod -Method Post -Uri "https://supportify-ai-gules.vercel.app/webhook/message" -ContentType "application/json" -Body '{"user_id":"12345","message":"hello","chat_id":"12345"}' | ConvertTo-Json
```

Telegram API connectivity test:

```powershell
Invoke-RestMethod -Method Get -Uri "https://api.telegram.org/bot<YOUR_BOT_TOKEN>/getMe" | ConvertTo-Json
```

### Troubleshooting
- `unknown webhook is not registered`: workflow is not published or trigger credential is invalid.
- `Missing required credential: telegramApi`: Telegram credential is not selected on one or more Telegram nodes.
- Browser console shows ngrok issues: use `http://127.0.0.1:5678` for editor, not ngrok URL.
- Do not keep trailing spaces in `WEBHOOK_URL`; a trailing space becomes `%20` and breaks requests.

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
