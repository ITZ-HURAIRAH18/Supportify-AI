# Supportify AI 🚀

[![FastAPI](https://img.shields.io/badge/FastAPI-005571?style=for-the-badge&logo=fastapi)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Google Gemini](https://img.shields.io/badge/Google_Gemini-8E75B2?style=for-the-badge&logo=google&logoColor=white)](https://deepmind.google/technologies/gemini/)
[![n8n](https://img.shields.io/badge/n8n-FF6C37?style=for-the-badge&logo=n8n&logoColor=white)](https://n8n.io/)

Supportify AI is a production-grade, AI-driven Customer Support Automation system. It bridges the gap between Telegram-based customer interactions and centralized business management. By leveraging **Google Gemini 2.0 Flash**, it provides human-like intelligence for order processing, product inquiries, and complaint handling.

---

## 🌟 Key Features

*   🤖 **Intelligent AI Conversations**: Powered by Google Gemini 2.0 Flash with a persistent context of the last 8 messages.
*   🛍️ **Smart Order Flow**: Automated detection of products, quantities, and delivery locations directly from chat.
*   📊 **Real-time Analytics Dashboard**: Premium React dashboard featuring conversion trends, intent breakdown, and order history.
*   ⚡ **Hybrid Logic System**: Smart rule-based fallbacks ensure the bot remains responsive even if AI limits are reached.
*   📍 **Location-aware Logistics**: Automatic delivery date calculation based on the user's city (supports major Pakistani cities).
*   👤 **Auto-Username Detection**: Seamlessly greets users by their Telegram names for a personalized experience.
*   🔄 **Automated Webhooks**: Orchestrated via **n8n** for robust message routing and error handling.

---

## 🔗 Live Demos

| Component | URL |
| :--- | :--- |
| **Admin Dashboard** | [https://supportai-telegram-bot.vercel.app/](https://supportai-telegram-bot.vercel.app/) |
| **Backend API** | [https://supportify-ai-gules.vercel.app](https://supportify-ai-gules.vercel.app) |
| **Telegram Bot** | [Search for your bot username on Telegram] |

---

## 🛠️ Tech Stack

### Backend (The Brain)
- **Framework**: FastAPI (Python 3.12+)
- **AI Model**: Google Gemini 2.0 Flash (via `google-genai`)
- **Database**: PostgreSQL with SQLAlchemy ORM
- **Migrations**: Alembic
- **Environment**: Pydantic Settings

### Frontend (The Control Center)
- **Library**: React 19 + Vite
- **Styling**: Tailwind CSS + Lucide React (Icons)
- **Charts**: Recharts
- **API Client**: Axios

### Automation (The Bridge)
- **Workflow Engine**: n8n
- **Integration**: Telegram Bot API Webhooks

---

## 📂 Project Structure

```text
Supportify AI/
├── backend/            # FastAPI Application
│   ├── app/
│   │   ├── api/        # API Routes (Endpoints)
│   │   ├── db/         # Database Connection & Session
│   │   ├── models/     # SQLAlchemy Models
│   │   ├── schemas/    # Pydantic Schemas
│   │   └── services/   # AI Logic & Order Management
│   ├── alembic/        # Database Migrations
│   └── main.py         # Entry Point
├── frontend/           # React Dashboard
│   ├── src/
│   │   ├── api/        # API Service Layer
│   │   ├── components/ # Reusable UI Components
│   │   ├── hooks/      # Custom React Hooks
│   │   └── pages/      # Dashboard, Orders, Users, Products
├── n8n_workflow.json   # Pre-configured n8n workflow
└── README.md           # Documentation
```

---

## 🚀 Installation & Setup

### 1. Prerequisites
- Node.js 18+ & npm
- Python 3.12+
- PostgreSQL Database
- Google Gemini API Key
- Telegram Bot Token (from @BotFather)

### 2. Backend Setup
```bash
cd backend
# Create virtual environment
python -m venv .venv
source .venv/bin/activate  # Windows: .venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt # or 'uv sync' if using uv

# Configure environment variables
cp .env.example .env 
# Edit .env with your DATABASE_URL, GEMINI_API_KEY, etc.

# Run migrations
alembic upgrade head

# Start server
uvicorn app.main:app --reload
```

### 3. Frontend Setup
```bash
cd frontend
npm install

# Configure environment variables
cp .env.example .env
# Set VITE_API_URL to http://localhost:8000

# Start development server
npm run dev
```

### 4. n8n Automation
1. Install and start n8n locally or via Docker.
2. Import `n8n_workflow.json`.
3. Configure your **Telegram Credentials** and **HTTP Request** node to point to your backend.
4. Set the Telegram Webhook URL using `ngrok` if testing locally.

---

## ☁️ Deployment

### Backend (Vercel/Render/Railway)
1. Set the root directory to `backend`.
2. Configure all environment variables from `.env`.
3. Use `uvicorn app.main:app` as the start command.

### Frontend (Vercel/Netlify)
1. Set the root directory to `frontend`.
2. Build command: `npm run build`.
3. Output directory: `dist`.
4. Set `VITE_API_BASE_URL` to your production backend URL.

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:
1. Fork the Project.
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`).
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`).
4. Push to the Branch (`git push origin feature/AmazingFeature`).
5. Open a Pull Request.

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

---

**Developed with ❤️ by the Supportify AI Team**
