# SUPPORTIFY AI - Complete Architecture

## 1. Project Overview

**Supportify AI** is an AI-driven Customer Support Automation system that bridges Telegram-based customer interactions with a centralized admin dashboard. It uses Google Gemini 2.0 Flash for AI conversations, FastAPI for the backend, React for the admin dashboard, PostgreSQL (via Supabase) for persistence, and n8n as a workflow automation bridge between Telegram and the backend.

**Live Deployments**:
- Admin Dashboard: `https://supportai-telegram-bot.vercel.app/`
- Backend API: `https://supportify-ai-gules.vercel.app`
- Telegram Bot: `@Ai_supportsbot`

---

## 2. Directory Structure

```
Supportify AI/
|-- .gitignore                          # Ignores .gemini directory
|-- LICENSE                             # MIT License
|-- README.md                           # Root project documentation
|-- n8n_Workflow.json                   # Pre-configured n8n automation workflow
|
|-- .gemini/
|   |-- agents/                         # 162 Gemini agent role definitions (markdown)
|       |-- backend-architect.md
|       |-- frontend-developer.md
|       |-- ai-engineer.md
|       |-- ... (162 agent files total)
|
|-- backend/                            # FastAPI Python Backend
|   |-- .env                            # Environment config (Supabase DB, Gemini key)
|   |-- .env.example                    # Environment template
|   |-- .gitignore                      # Ignores .env, env, ngrok.exe
|   |-- .python-version                 # Python 3.13
|   |-- main.py                         # Placeholder entry (unused)
|   |-- ngrok.exe                       # ngrok binary for local tunneling
|   |-- pyproject.toml                  # Python dependencies (uv/pip)
|   |-- uv.lock                         # uv lockfile
|   |-- README.md                       # Backend-specific documentation
|   |-- alembic.ini                     # Alembic migration configuration
|   |
|   |-- app/                            # Main application package
|   |   |-- main.py                     # FastAPI app creation, CORS, middleware
|   |   |
|   |   |-- api/
|   |   |   |-- routes.py               # All API endpoint definitions
|   |   |
|   |   |-- db/
|   |   |   |-- database.py             # SQLAlchemy engine, session, Base
|   |   |
|   |   |-- models/
|   |   |   |-- models.py               # SQLAlchemy ORM models (5 tables)
|   |   |
|   |   |-- schemas/
|   |   |   |-- schemas.py              # Pydantic request/response schemas
|   |   |
|   |   |-- services/
|   |       |-- ai_service.py           # Gemini AI integration + rule fallback
|   |       |-- order_service.py        # Order creation + delivery calculation
|   |
|   |-- alembic/                        # Database migration system
|       |-- env.py                      # Alembic environment config
|       |-- script.py.mako             # Migration file template
|       |-- README                      # Generic single-db config note
|       |-- versions/
|           |-- d86a078c4d56_initial_migration.py
|           |-- ad64465887c3_initial_migration.py
|           |-- cd511c28d326_add_telegram_id_to_users.py
|           |-- abc123order001_add_location_tracking_delivery_dates_and_order_items.py
|
|-- frontend/                           # React Admin Dashboard
    |-- .env                            # Dev environment (points to Vercel backend)
    |-- .env.example                    # Environment template
    |-- .env.production                 # Production overrides
    |-- .gitignore                      # Standard Node ignores
    |-- eslint.config.js                # ESLint flat config
    |-- index.html                      # Vite HTML entry point
    |-- package.json                    # NPM dependencies and scripts
    |-- package-lock.json               # Lock file
    |-- postcss.config.js               # PostCSS (Tailwind + Autoprefixer)
    |-- tailwind.config.js              # Tailwind CSS custom theme
    |-- vite.config.js                  # Vite config with React plugin
    |-- README.md                       # Frontend-specific documentation
    |
    |-- public/
    |   |-- favicon.svg                 # Browser favicon
    |   |-- icons.svg                   # SVG icon sprite
    |
    |-- src/
        |-- main.jsx                    # React DOM entry point (StrictMode)
        |-- App.jsx                     # Root component, Router, Layout
        |-- App.css                     # Vite boilerplate CSS (unused)
        |-- index.css                   # Tailwind directives + custom fonts/scrollbar
        |
        |-- api/
        |   |-- index.js                # Axios API client + all API functions
        |
        |-- assets/
        |   |-- hero.png                # Hero image asset
        |   |-- react.svg               # React logo
        |   |-- vite.svg                # Vite logo
        |
        |-- components/
        |   |-- Badge.jsx               # Status badge with color variants
        |   |-- DataTable.jsx           # Generic sortable data table
        |   |-- Header.jsx              # Top header bar with title + avatar
        |   |-- Modal.jsx               # Modal dialog with Escape key support
        |   |-- Sidebar.jsx             # Left navigation sidebar
        |   |-- Skeleton.jsx            # Loading skeleton placeholder
        |   |-- StatCard.jsx            # Dashboard statistic card
        |
        |-- hooks/
        |   |-- useFetch.js             # Generic async data-fetching hook
        |
        |-- pages/
            |-- Dashboard.jsx           # Main analytics dashboard
            |-- Conversations.jsx       # Conversation history viewer
            |-- Users.jsx               # User management list
            |-- Products.jsx            # Product management (grid + add modal)
            |-- Orders.jsx              # Order management (tabbed filtering)
```

---

## 3. Pages and Routes

### Frontend Routes (React Router - `App.jsx`)

| Route | Component | Description |
|---|---|---|
| `/` | `<Dashboard />` | Main analytics dashboard showing KPIs, charts, and recent activity |
| `/dashboard` | `<Dashboard />` | Same as above (explicit path) |
| `/conversations` | `<Conversations />` | Browse all AI conversations with search, filter, and pagination |
| `/conversations?userId=N` | `<Conversations />` | Filtered view showing conversations for a specific user |
| `/users` | `<Users />` | List all registered users with conversation counts |
| `/products` | `<Products />` | Product catalog management with card grid and add functionality |
| `/orders` | `<Orders />` | Order management with tab-based status filtering |

### Backend API Routes (`routes.py`)

| Method | Endpoint | Description |
|---|---|---|
| GET | `/health` | Health check endpoint |
| POST | `/message` | Generic message processing (takes user_id + message) |
| POST | `/webhook/message` | Main Telegram webhook - receives n8n-forwarded messages, creates users, processes AI, creates orders |
| GET | `/conversations` | List conversations (paginated, optional user_id filter) |
| GET | `/users` | List all users (paginated) |
| POST | `/users` | Create a new user |
| GET | `/products` | List all products (paginated) |
| POST | `/products` | Create a new product |
| GET | `/orders` | List all orders (paginated, sorted by created_at desc) |
| GET | `/orders/user/{user_id}` | Get orders for a specific user |
| POST | `/orders` | Create a new order directly |
| GET | `/ai/user/{user_id}` | AI-context user data (read-only, for internal API calls) |
| GET | `/ai/orders/{user_id}` | AI-context recent orders (read-only) |
| GET | `/ai/products` | AI-context product catalog (read-only) |
| GET | `/ai/conversations/{user_id}` | AI-context conversation history (read-only) |

---

## 4. Components

### Reusable UI Components (`frontend/src/components/`)

| Component | File | Purpose |
|---|---|---|
| **Sidebar** | `Sidebar.jsx` | Fixed left navigation (240px wide). Renders 5 nav links (Dashboard, Conversations, Users, Products, Orders) with Lucide icons. Highlights active route. Shows "SupportAI" branding with version number. |
| **Header** | `Header.jsx` | Sticky top header bar. Displays dynamic page title (from route), notification bell with dot indicator, and "SA" avatar circle. |
| **StatCard** | `StatCard.jsx` | Dashboard metric card. Displays a title, large numeric value, optional trend badge (up/down/warning), and an icon. Uses the Badge component for trend display. |
| **DataTable** | `DataTable.jsx` | Generic table component. Accepts `columns` (with custom `render` functions), `data`, `loading`, and `emptyMessage` props. Shows Skeleton during loading. Supports alternating row colors and hover effects. |
| **Modal** | `Modal.jsx` | Overlay modal dialog. Supports backdrop blur, Escape key to close, body scroll lock, and fade/zoom animation. Renders title + children content. |
| **Badge** | `Badge.jsx` | Inline status badge. Supports variants: success (green), warning (amber), danger (red), info (blue), orange, gray. Pill-shaped. |
| **Skeleton** | `Skeleton.jsx` | Loading placeholder. Renders N animated pulse bars to indicate loading state. |

### Page Components (`frontend/src/pages/`)

| Page | File | Purpose |
|---|---|---|
| **Dashboard** | `Dashboard.jsx` | Main analytics view. Shows 4 StatCards (Total Conversations, Active Users, Products, Confirmed Orders). Renders a Recharts LineChart of conversations over 7 days and a PieChart for intent breakdown (price_query, order_status, complaint, general). Shows 5 most recent conversations in a DataTable. |
| **Conversations** | `Conversations.jsx` | Full conversation log with search, user filtering via `?userId=` query param, and client-side pagination (10 per page). Shows columns: ID, User ID, Message (truncated), AI Reply (truncated), Intent (Badge), Timestamp. |
| **Users** | `Users.jsx` | User management. Fetches users + conversations in parallel, calculates per-user conversation counts. Displays avatar (initials), name, email/phone, joined date, conversation count, and a "View" button that navigates to `/conversations?userId=N`. |
| **Products** | `Products.jsx` | Product management in a 3-column card grid. Each card shows name, price (Rs.), description, and edit/delete buttons (UI-only). Has an "Add product" button that opens a Modal form for creating products via the API. |
| **Orders** | `Orders.jsx` | Order management with tab-based filtering (All, Pending, Completed, Cancelled). Table columns: Order ID, User, Amount (Rs.), Status (color-coded Badge), Date, and a View button (UI-only). |

---

## 5. Custom Hook

| Hook | File | Purpose |
|---|---|---|
| **useFetch** | `hooks/useFetch.js` | Generic async data-fetching hook. Manages `data`, `loading`, `error` states. Accepts a fetch function and dependency array. Provides a `refetch` callback for manual re-fetching. |

---

## 6. API Service Layer

### Frontend API Client (`frontend/src/api/index.js`)

All API calls use an Axios instance with a configurable base URL (defaults to `https://supportify-ai-gules.vercel.app`).

| Function | Method | Endpoint | Purpose |
|---|---|---|---|
| `getConversations(skip, limit, userId)` | GET | `/conversations` | Fetch conversations, optional user filter |
| `getUsers(skip, limit)` | GET | `/users` | Fetch all users |
| `getProducts(skip, limit)` | GET | `/products` | Fetch all products |
| `createProduct(data)` | POST | `/products` | Create a new product |
| `getOrders(skip, limit)` | GET | `/orders` | Fetch all orders |
| `getDashboardStats()` | GET | Multiple (parallel) | Aggregates data: calls getConversations, getUsers, getProducts, getOrders in parallel, then computes totals |

### Backend Services

#### AI Service (`backend/app/services/ai_service.py`)

The core intelligence engine:

1. **Google Gemini Integration**: Uses `google-genai` client with generation config (temperature 0.2, max 1024 tokens, JSON response format).
2. **Model Fallback Chain**: Tries `gemini-2.5-flash` -> `gemini-2.0-flash` -> `gemini-2.0-flash-lite` if the primary model fails.
3. **API-Based Data Access**: The AI service calls its own backend's `/api/ai/*` endpoints via `requests.get()` to fetch user data, orders, products, and conversation history.
4. **Greeting Detection**: Regex-based pattern matching for "hi", "hello", "hey", etc. Returns personalized greeting using user's first name.
5. **Deterministic Order Flow**: A rule-based system that tracks order context across conversation history. Extracts products (by name matching), quantities (numeric regex), and locations (known Pakistani cities or address keywords). Guides users through: product -> quantity -> location -> confirmation.
6. **JSON Payload Extraction**: Robust parser that tries raw JSON, fenced code blocks, and regex extraction to handle Gemini's sometimes-inconsistent JSON output.
7. **Rule-Based Fallback**: When Gemini is unavailable, falls back to keyword-matching for product_inquiry, order_tracking, place_order, complaint, and general intents.
8. **System Prompt**: Detailed prompt instructing Gemini to act as a "God-level Customer Support AI Assistant" with intent detection and structured JSON output.

**Detected Intents**: `greeting`, `product_inquiry`, `order_inquiry`, `place_order`, `order_tracking`, `complaint`, `general`

**Detected Actions**: `none`, `ask_product`, `ask_quantity`, `ask_location`, `confirm_order`

**Known Cities** (for delivery): Karachi, Lahore, Islamabad, Rawalpindi, Multan, Faisalabad, Peshawar, Quetta, Gilgit

#### Order Service (`backend/app/services/order_service.py`)

| Function | Purpose |
|---|---|
| `get_delivery_days(location)` | Maps city name to delivery days (Karachi=1, Lahore/Islamabad=2, Multan/Faisalabad/Peshawar=3, Quetta=4, Gilgit=5, default=3) |
| `calculate_delivery_date(location)` | Calculates estimated delivery date based on location |
| `create_order_from_confirmation(db, user_id, product_id, quantity, location)` | Creates Order + OrderItem, updates user location, calculates total, returns order details |
| `get_order_by_user(db, user_id, limit)` | Fetches recent orders for a user with formatted details |

---

## 7. Database Schema (SQLAlchemy Models)

### Tables (5 total)

#### `users`
| Column | Type | Constraints |
|---|---|---|
| `id` | Integer | PK, indexed |
| `name` | String | indexed |
| `phone` | String | indexed |
| `email` | String | unique, indexed |
| `telegram_id` | String | unique, indexed, nullable |
| `location` | String | nullable |
| `created_at` | DateTime | default=utcnow |

**Relationships**: `conversations` (one-to-many), `orders` (one-to-many)

#### `conversations`
| Column | Type | Constraints |
|---|---|---|
| `id` | Integer | PK, indexed |
| `user_id` | Integer | FK -> users.id |
| `message` | String | |
| `response` | String | |
| `intent` | String | |
| `timestamp` | DateTime | default=utcnow |

**Relationships**: `user` (many-to-one)

#### `orders`
| Column | Type | Constraints |
|---|---|---|
| `id` | Integer | PK, indexed |
| `user_id` | Integer | FK -> users.id |
| `status` | String | default="pending", non-null |
| `payment_method` | String | default="COD" |
| `amount` | Float | |
| `location` | String | nullable |
| `delivery_date` | DateTime | nullable |
| `notes` | Text | nullable |
| `created_at` | DateTime | default=utcnow |
| `updated_at` | DateTime | default=utcnow, onupdate=utcnow |

**Relationships**: `user` (many-to-one), `items` (one-to-many, cascade delete)

#### `order_items`
| Column | Type | Constraints |
|---|---|---|
| `id` | Integer | PK, indexed |
| `order_id` | Integer | FK -> orders.id, indexed |
| `product_id` | Integer | FK -> products.id, indexed |
| `quantity` | Integer | |
| `price` | Float | |
| `created_at` | DateTime | |

**Relationships**: `order` (many-to-one), `product` (many-to-one)

#### `products`
| Column | Type | Constraints |
|---|---|---|
| `id` | Integer | PK, indexed |
| `name` | String | indexed |
| `price` | Float | |
| `description` | String | |

### Migration History (Alembic)

| # | Revision | Description |
|---|---|---|
| 1 | `d86a078c4d56` | Initial migration - creates `users`, `products`, `conversations`, `orders` tables |
| 2 | `ad64465887c3` | Empty follow-up (no-op) |
| 3 | `cd511c28d326` | Adds `telegram_id` column to `users` (unique, indexed) |
| 4 | `abc123order001` | Adds `location` to users; adds `location`, `delivery_date`, `payment_method`, `notes`, `updated_at` to orders; creates `order_items` table |

---

## 8. Pydantic Schemas

### Request Schemas
| Schema | Fields | Purpose |
|---|---|---|
| `MessageRequest` | `user_id: int`, `message: str` | Generic message endpoint input |
| `TelegramWebhookRequest` | `user_id?, message?, chat_id?, username?, first_name?, last_name?` | Telegram webhook input with sophisticated model_validator that normalizes nested Telegram API payloads |
| `UserCreate` | `name, phone?, email, location?` | User creation |
| `ProductCreate` | `name, price, description` | Product creation |
| `OrderCreate` | `status, amount, location?, delivery_date?, payment_method, notes?, user_id` | Order creation |
| `ConversationCreate` | `message, user_id` | Conversation creation |

### Response Schemas
| Schema | Fields | Purpose |
|---|---|---|
| `UserResponse` | `id, name, phone?, email, location?, created_at` | User data |
| `ConversationResponse` | `id, user_id, message, response, intent, timestamp` | Conversation data |
| `OrderResponse` | `id, user_id, status, amount, location?, delivery_date?, payment_method, notes?, created_at, updated_at, items: List[OrderItemResponse]` | Full order with items |
| `OrderItemResponse` | `id, order_id, product_id, quantity, price, created_at` | Individual order item |
| `ProductResponse` | `id, name, price, description` | Product data |
| `TelegramWebhookResponse` | `reply: str, intent: str, chat_id?: str` | Telegram reply format (sent back to n8n) |

---

## 9. n8n Workflow Automation

The n8n workflow (`n8n_Workflow.json`) bridges Telegram and the backend:

```
Telegram Trigger -> "Has Text?" (If node)
    |-- [True]  -> "Send to FastAPI" (HTTP POST to /webhook/message)
    |               |-- [Success] -> "Send Telegram Reply" (sends $json.reply to chat)
    |               |-- [Error]   -> "Reply On HTTP Error" (error message to user)
    |-- [False] -> "Reply Non-Text" ("Please send text messages only.")
```

**Nodes**:
1. **Telegram Trigger**: Listens for incoming Telegram messages via webhook
2. **Has Text?**: Conditional check - is the message text non-empty?
3. **Send to FastAPI**: POSTs to `https://supportify-ai-gules.vercel.app/webhook/message` with JSON body containing `user_id`, `message`, `chat_id`, `username`, `first_name`, `last_name`
4. **Send Telegram Reply**: Sends the AI's reply back to the Telegram chat using HTML parse mode
5. **Reply Non-Text**: Sends "Please send text messages only." for non-text inputs
6. **Reply On HTTP Error**: Sends a temporary error message if the backend is unreachable

---

## 10. Data Flow - End-to-End Message Processing

```
1. User sends Telegram message
2. n8n Telegram Trigger receives it
3. n8n "Has Text?" checks if message has text
4. n8n POSTs to FastAPI /webhook/message with Telegram payload
5. FastAPI normalizes the payload (TelegramWebhookRequest validator)
6. Looks up or creates User by telegram_id
7. Calls AI service: process_message(db, user_id, message)
8. AI service fetches context via internal API calls:
   - GET /api/ai/user/{id}       -> user data
   - GET /api/ai/orders/{id}     -> recent orders
   - GET /api/ai/products        -> product catalog
   - GET /api/ai/conversations/{id} -> conversation history
9. Checks for greeting -> returns personalized greeting
10. Checks deterministic order flow (tracks product/qty/location across messages)
11. If no deterministic match, sends prompt to Gemini AI with full context
12. If Gemini fails, falls back to rule-based keyword matching
13. Returns structured response: {intent, response, action, product_id, quantity, location}
14. If action == "confirm_order", OrderService creates the order
15. Saves Conversation record to database
16. Returns TelegramWebhookResponse (reply, intent, chat_id) to n8n
17. n8n sends the reply back to the Telegram chat
```

---

## 11. Deployment Architecture

```
                    +----------------+
                    |    Telegram    |
                    |      Bot       |
                    +--------+-------+
                             | Webhook
                    +--------v-------+
                    |      n8n       | (runs locally via ngrok tunnel,
                    |    Workflow    |  or hosted)
                    +--------+-------+
                             | HTTP POST
                    +--------v-------+
                    |    FastAPI     | (deployed on Vercel)
                    |    Backend     |
                    +--+---------+---+
                       |         |
              +--------v--+ +---v-----------+
              | PostgreSQL | | Google        |
              | (Supabase) | | Gemini API    |
              +------------+ +---------------+

                    +----------------+
                    |  React Admin   | (deployed on Vercel)
                    |   Dashboard    |---- HTTP GET/POST --> FastAPI Backend
                    +----------------+
```

---

## 12. Design System (Tailwind Theme)

The frontend uses a custom dark warm-tone design system:

| Token | Value | Usage |
|---|---|---|
| `bg.base` | `#12110d` | Page background |
| `bg.surface` | `#1a1813` | Elevated surfaces (sidebar, inputs) |
| `bg.card` | `#22201a` | Card backgrounds |
| `bg.hover` | `#2a2720` | Hover states |
| `accent.DEFAULT` | `#f54e00` | Primary accent (orange) |
| `accent.hover` | `#cf2d56` | Hover accent (magenta shift) |
| `text.primary` | `#f2f1ed` | Primary text |
| `status.success` | `#43b98f` | Success states (green) |
| `status.warning` | `#d5a05b` | Warning states (amber) |
| `status.danger` | `#e06586` | Danger states (pink-red) |
| `status.info` | `#9fbbe0` | Info states (blue) |

**Fonts**: CursorGothic / Space Grotesk (headings), jjannon / EB Garamond (body), Berkeley Mono (code).

---

## 13. Third-Party Integrations

| Integration | Technology | Purpose |
|---|---|---|
| **Google Gemini AI** | `google-genai` + `google-generativeai` Python SDKs | AI-powered customer conversation processing |
| **Telegram Bot API** | n8n Telegram nodes | Receives customer messages, sends AI replies back |
| **n8n** | Self-hosted workflow automation | Orchestration layer between Telegram and FastAPI |
| **Supabase (PostgreSQL)** | PostgreSQL via Supabase pooler | Cloud database hosting |
| **Vercel** | Frontend + Backend deployment | Hosts both the React dashboard and FastAPI backend |
| **Recharts** | React charting library | LineChart (conversation trends) and PieChart (intent breakdown) in dashboard |
| **Lucide React** | Icon library | All icons throughout the UI |
| **Axios** | HTTP client | Frontend API communication |
| **Tailwind CSS** | Utility-first CSS framework | All styling with custom design tokens |

---

## 14. Authentication / Authorization

**There is NO authentication or authorization system implemented.** The backend API is entirely open:

- All API endpoints are unprotected (no JWT, session, API key, or OAuth)
- CORS middleware uses `allow_origins=["*"]` as a fallback
- The admin dashboard has no login page
- No user roles or permission checks
- The Telegram webhook endpoint is open to anyone who can POST to it

---

## 15. State Management

**There is NO global state management library** (no Redux, Zustand, Jotai, or React Context).

State is managed entirely through:
- **Component-local state** (`useState`) - search terms, pagination, modal visibility, form data, active tabs
- **React Router state** - query params (`?userId=N`) for cross-page filtering
- **`useFetch` hook** - manages data/loading/error states per component
- **URL as source of truth** - the Conversations page reads `searchParams.get("userId")` to filter data

Data is fetched fresh on every page mount/re-render. No caching layer.

---

## 16. Dependencies

### Backend (`pyproject.toml`)
| Package | Version | Purpose |
|---|---|---|
| `fastapi` | >=0.136.0 | Web framework |
| `uvicorn` | >=0.44.0 | ASGI server |
| `sqlalchemy` | >=2.0.49 | ORM |
| `alembic` | >=1.18.4 | Database migrations |
| `psycopg2-binary` | >=2.9.11 | PostgreSQL driver |
| `google-genai` | >=1.73.1 | Gemini AI client (new SDK) |
| `google-generativeai` | >=0.8.6 | Gemini AI client (legacy SDK) |
| `pydantic` | >=2.13.2 | Data validation |
| `pydantic-settings` | >=2.14.0 | Environment settings |
| `python-dotenv` | >=1.2.2 | .env file loading |
| `requests` | >=2.31.0 | HTTP client (for internal API calls from AI service) |

### Frontend (`package.json`)
| Package | Version | Purpose |
|---|---|---|
| `react` | ^19.2.5 | UI library |
| `react-dom` | ^19.2.5 | DOM renderer |
| `react-router-dom` | ^7.14.1 | Client-side routing |
| `axios` | ^1.15.1 | HTTP client |
| `recharts` | ^3.8.1 | Charts |
| `lucide-react` | ^1.8.0 | Icons |
| `tailwindcss-animate` | ^1.0.7 | Animation utilities |
| `vite` | ^8.0.9 | Build tool |
| `tailwindcss` | ^3.4.19 | CSS framework |

---

## 17. Security Observations

1. **Exposed credentials**: The `backend/.env` file contains a live Supabase PostgreSQL connection string and Google Gemini API key in plaintext.
2. **No authentication**: All API endpoints are publicly accessible. Anyone can read/write users, products, orders, and conversations.
3. **CORS wildcard**: The CORS middleware includes `"*"` as a fallback origin, allowing any website to make API requests.
4. **No rate limiting**: The webhook endpoint has no rate limiting or abuse protection.
5. **ngrok.exe committed**: A binary executable is included in the repository.

---

## 18. Unused / Dead Code

| File | Status |
|---|---|
| `backend/main.py` | Placeholder `print("Hello from backend!")` - not used as entry point |
| `frontend/src/App.css` | Vite boilerplate CSS - not imported by any component |
| `frontend/src/assets/hero.png` | Not referenced in any component |
| `frontend/src/assets/react.svg` | Not referenced in any component |
| `frontend/src/assets/vite.svg` | Not referenced in any component |
| `date-fns` package | Listed in `package.json` but never imported |
