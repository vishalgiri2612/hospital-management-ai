# 🏥 Hospital Management System with AI-Driven Features

A comprehensive, production-ready hospital management system built with Node.js/Express backend and React frontend, featuring AI-powered analytics and real-time notifications.

## ✨ Features

### Core Modules
- **Patient Management** – Registration, medical history, health records, risk assessment
- **Doctor & Staff Management** – Profiles, schedules, specializations
- **Appointment Scheduling** – AI-optimized booking with no-show prediction
- **Medical Records (EHR)** – Digital health records with full history
- **Billing & Insurance** – Invoice generation, payment processing, insurance tracking
- **Inventory Management** – Stock tracking, low-stock alerts, demand forecasting
- **Admin Dashboard** – Analytics, capacity planning, revenue reports

### 🤖 AI/ML Features
- **Patient Health Risk Prediction** – Multi-factor risk scoring (age, conditions, medications)
- **Appointment Optimization** – No-show probability prediction and schedule efficiency analysis
- **Emergency Detection** – Real-time vital signs monitoring with critical condition alerts
- **Readmission Risk Assessment** – 30-day readmission probability scoring
- **Resource Allocation** – Predictive staffing and bed capacity planning
- **Inventory Demand Forecasting** – AI-driven restock recommendations

### 🔒 Security
- JWT authentication with refresh token rotation
- Role-based access control (Admin, Doctor, Nurse, Receptionist, Patient)
- Rate limiting and request validation
- Helmet.js security headers
- Input sanitization with express-validator

### 📡 Real-time
- Socket.io for live emergency alerts
- Real-time appointment notifications
- Live dashboard updates

## 🛠 Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | Node.js 18+ / Express.js |
| Frontend | React 18 / Redux Toolkit |
| Database | PostgreSQL 15 / Sequelize ORM |
| AI/ML | Statistical models (no external ML deps) |
| Real-time | Socket.io |
| Auth | JWT / bcryptjs |
| Charts | Chart.js / react-chartjs-2 |
| Deployment | Docker / Docker Compose / Nginx |

## 🚀 How to Run

### Prerequisites
- **[Node.js 18+](https://nodejs.org/)** – required for manual setup
- **[PostgreSQL 15+](https://www.postgresql.org/download/)** – required for manual setup
- **[Docker + Docker Compose](https://docs.docker.com/get-docker/)** – required for Docker setup (recommended, no separate PostgreSQL needed)

---

### ▶ Option 1: Docker Compose (Recommended — fastest, no local DB needed)

This is the easiest way to run everything with a single command.

```bash
# 1. Clone the repository
git clone https://github.com/vishalgiri2612/hospital-management-ai.git
cd hospital-management-ai

# 2. (Optional) customise secrets — the defaults work for local testing
cp backend/.env.example backend/.env
# Open backend/.env and change DB_PASSWORD, JWT_SECRET, JWT_REFRESH_SECRET
# if you want to use your own values.

# 3. Build images and start all three services (PostgreSQL + API + React)
docker compose up -d

# 4. Wait ~30 seconds for the database to initialise, then seed the admin account
docker exec hms_backend node scripts/seedAdmin.js
```

**Access the application:**

| Service | URL |
|---------|-----|
| 🖥 Frontend (React) | http://localhost |
| ⚙️  Backend API | http://localhost:5000 |
| 📚 API Docs (Swagger) | http://localhost:5000/api-docs |
| 🔍 Health check | http://localhost:5000/health |

**Default admin login** (created by the seed command above):

| Field | Value |
|-------|-------|
| Email | `admin@hospital.com` |
| Password | `Admin@12345` |

> ⚠️ Change the password immediately after your first login.

**Stop the application:**
```bash
docker compose down          # stop containers (data is preserved)
docker compose down -v       # stop containers AND delete database volume
```

---

### ▶ Option 2: Manual Setup (Node.js + local PostgreSQL)

#### Step 1 – Create the database

```sql
-- run as the postgres superuser
CREATE DATABASE hospital_db;
CREATE USER hms_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE hospital_db TO hms_user;
```

#### Step 2 – Configure the backend

```bash
cd backend
cp .env.example .env
```

Open `backend/.env` and set at minimum:

```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=hospital_db
DB_USER=hms_user
DB_PASSWORD=your_password        # match what you used above

JWT_SECRET=a-very-long-random-string-at-least-32-chars
JWT_REFRESH_SECRET=another-very-long-random-string

FRONTEND_URL=http://localhost:3000
```

#### Step 3 – Start the backend

```bash
cd backend
npm install          # install dependencies
npm run dev          # starts on http://localhost:5000
```

The first time the server starts it automatically **creates all database tables** (Sequelize `sync`). You will see:

```
Database connection established successfully.
Database models synchronized.
🏥 Hospital Management API running on port 5000
📚 API Docs available at http://localhost:5000/api-docs
```

#### Step 4 – Seed the default admin account

Open a second terminal:

```bash
cd backend
npm run seed:admin
```

Expected output:

```
✅ Admin account created successfully.
   Email   : admin@hospital.com
   Password: Admin@12345
   ⚠️  Change this password after your first login!
```

#### Step 5 – Configure and start the frontend

```bash
cd frontend
cp .env.example .env
# The default .env works with http://localhost:5000 out of the box

npm install
npm start            # starts on http://localhost:3000
```

**Access the application:**

| Service | URL |
|---------|-----|
| 🖥 Frontend (React) | http://localhost:3000 |
| ⚙️  Backend API | http://localhost:5000 |
| 📚 API Docs (Swagger) | http://localhost:5000/api-docs |

---

### 💻 Option 3: VS Code (with integrated debugging and tasks)

This is the best option if you want to **set breakpoints**, step through code, or use VS Code's built-in terminal.

#### Prerequisites
- [VS Code](https://code.visualstudio.com/) installed
- Node.js 18+ and PostgreSQL 15+ installed (same as Option 2)

#### Step 1 – Open the project workspace

```bash
# Clone if you haven't already
git clone https://github.com/vishalgiri2612/hospital-management-ai.git

# Open the root folder in VS Code
code hospital-management-ai
```

Or use **File → Open Folder…** and select the `hospital-management-ai` folder.

#### Step 2 – Install recommended extensions

VS Code will automatically prompt: _"Do you want to install the recommended extensions for this repository?"_ — click **Install All**.

If the prompt doesn't appear, open the Extensions panel (`Ctrl+Shift+X` / `Cmd+Shift+X`), type `@recommended`, and install from the list.

Key extensions installed:
- **ESLint** – inline linting
- **Prettier** – auto-format on save
- **Docker** – docker-compose support
- **REST Client** – send API requests from `.http` files
- **ES7+ React Snippets** – React component shortcuts

#### Step 3 – Run setup tasks (first time only)

Open the **Command Palette** (`Ctrl+Shift+P` / `Cmd+Shift+P`) and type:

```
Tasks: Run Task
```

Run these tasks **in order** the first time:

| # | Task name | What it does |
|---|-----------|-------------|
| 1 | `⚙️  Setup: Copy backend .env` | Creates `backend/.env` from the example |
| 2 | `⚙️  Setup: Copy frontend .env` | Creates `frontend/.env` from the example |
| 3 | `⚙️  Setup: Install all dependencies` | `npm install` in both `backend/` and `frontend/` |

> After step 1, **open `backend/.env`** and fill in `DB_PASSWORD`, `JWT_SECRET`, and `JWT_REFRESH_SECRET`.

#### Step 4 – Start the application

**Option A – Use integrated tasks:**

Open **Terminal → Run Task** and run:
- `▶  Start backend (dev + hot reload)` — starts on http://localhost:5000
- `▶  Start frontend` — starts on http://localhost:3000

VS Code opens a dedicated terminal panel for each process.

**Option B – Use the debugger (supports breakpoints):**

1. Press `F5` or open the **Run and Debug** panel (`Ctrl+Shift+D` / `Cmd+Shift+D`)
2. Select a configuration from the dropdown:

| Configuration | Description |
|--------------|-------------|
| `🐛 Debug Backend (launch)` | Starts backend with Node.js debugger. Set breakpoints in any `.js` file. |
| `🔗 Attach to Backend (nodemon --inspect)` | First run task `▶  Start backend (debug mode)`, then attach. Supports hot reload **and** breakpoints. |
| `🧪 Debug Backend Tests (all)` | Run all Jest tests with the debugger. |
| `🧪 Debug Backend Tests (current file)` | Debug only the test file currently open in the editor. |
| `🌐 Launch Frontend in Chrome` | Opens Chrome pointed at http://localhost:3000 with source maps. |
| `🏥 Full Stack (Backend + Frontend)` | Launches backend and Chrome in one click. |

#### Step 5 – Seed the admin account

In the Command Palette, run:

```
Tasks: Run Task → ⚙️  Setup: Seed admin account
```

Or open an integrated terminal (`Ctrl+` `` ` ``) and run:

```bash
cd backend
npm run seed:admin
```

#### Step 6 – Access the app

| Service | URL |
|---------|-----|
| 🖥 Frontend | http://localhost:3000 |
| ⚙️  Backend API | http://localhost:5000 |
| 📚 Swagger Docs | http://localhost:5000/api-docs |

Default login: `admin@hospital.com` / `Admin@12345`

#### Running tests from VS Code

| Shortcut | Action |
|----------|--------|
| `Ctrl+Shift+P` → `Tasks: Run Test Task` | Run all backend tests |
| Select `🧪 Test: backend unit tests` | Unit tests only |
| Select `🧪 Test: backend integration tests` | Integration tests only |
| Select `🧪 Test: backend with coverage` | Full coverage report |
| `F5` with `🧪 Debug Backend Tests (current file)` | Debug the open test file |

---

### 🧪 Running Tests (terminal)

```bash
cd backend
npm test                   # run all tests
npm run test:unit          # unit tests only  (AI services, helpers)
npm run test:integration   # integration tests only  (Auth API)
npm run test:coverage      # all tests with coverage report
```

> In VS Code, open the Command Palette (`Ctrl+Shift+P`) and choose **Tasks: Run Test Task** to run tests without leaving the editor.

---

### 🩺 Troubleshooting

| Symptom | Likely cause | Fix |
|---------|-------------|-----|
| `Unable to connect to the database` | PostgreSQL not running / wrong credentials | Verify `DB_*` values in `.env` and that PostgreSQL is running |
| Backend exits immediately on start | Missing required env vars | Make sure `backend/.env` exists and `JWT_SECRET` / `DB_PASSWORD` are set |
| `Cannot GET /` on port 5000 | You're hitting the API root — that's normal | Use `/health` to check status or `/api-docs` for the UI |
| Frontend shows "Network Error" | Backend not running or wrong `REACT_APP_API_URL` | Start the backend first; check `frontend/.env` |
| Docker: `port 80 already in use` | Another process is using port 80 | Change the frontend port mapping in `docker-compose.yml` (e.g. `"8080:80"`) |
| Docker: seed command fails | Container not ready yet | Wait 30 s for the health check to pass, then re-run `docker exec hms_backend node scripts/seedAdmin.js` |

## 📁 Project Structure

```
hospital-management-ai/
├── .vscode/
│   ├── launch.json      # Debugger configurations (F5)
│   ├── tasks.json       # Run/test/setup tasks (Ctrl+Shift+P → Tasks)
│   ├── extensions.json  # Recommended extensions
│   └── settings.json    # Workspace editor/ESLint settings
├── backend/
│   ├── src/
│   │   ├── config/          # Database, Swagger config
│   │   ├── controllers/     # Route handlers
│   │   ├── middleware/      # Auth, error handling, validation
│   │   ├── models/          # Sequelize ORM models
│   │   ├── routes/          # Express route definitions
│   │   ├── services/
│   │   │   └── ai/          # AI/ML service modules
│   │   ├── utils/           # Helpers, logger
│   │   └── app.js           # Application entry point
│   ├── scripts/
│   │   └── seedAdmin.js     # Seeds the default admin account
│   ├── tests/
│   │   ├── unit/            # Unit tests
│   │   └── integration/     # Integration tests
│   ├── .env.example
│   ├── Dockerfile
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/      # Reusable React components
│   │   ├── pages/           # Page-level components
│   │   ├── services/        # API client, Socket.io
│   │   ├── store/           # Redux slices
│   │   ├── App.js
│   │   └── index.js
│   ├── public/
│   ├── nginx.conf
│   ├── Dockerfile
│   └── package.json
├── docker-compose.yml
├── .gitignore
└── README.md
```

## 🌐 API Endpoints

Full Swagger documentation available at `/api-docs` when running the server.

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login |
| POST | `/api/auth/refresh` | Refresh JWT token |
| GET | `/api/auth/me` | Get current user |
| POST | `/api/auth/logout` | Logout |

### Patients
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/patients` | List patients |
| POST | `/api/patients` | Register patient |
| GET | `/api/patients/:id` | Get patient details |
| PUT | `/api/patients/:id` | Update patient |
| GET | `/api/patients/:id/risk-assessment` | AI risk assessment |
| POST | `/api/patients/:id/vitals/emergency-check` | Emergency detection |

### Appointments
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/appointments` | List appointments |
| POST | `/api/appointments` | Schedule appointment |
| GET | `/api/appointments/optimal-slots` | AI optimal time slots |
| PUT | `/api/appointments/:id` | Update appointment |
| POST | `/api/appointments/:id/cancel` | Cancel appointment |

### Admin
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/dashboard` | Dashboard statistics |
| GET | `/api/admin/capacity-forecast` | AI capacity planning |
| GET | `/api/admin/analytics` | Analytics data |

## 🔐 User Roles

| Role | Access Level |
|------|-------------|
| **admin** | Full system access |
| **doctor** | Patients, appointments, medical records |
| **nurse** | Patients, appointments, vitals |
| **receptionist** | Patients, appointments, billing |
| **patient** | Own records only |

## 🤖 AI Services

### Health Risk Prediction
Computes a risk score (0-1) based on:
- Age and demographic factors
- Chronic conditions count
- Medication complexity (polypharmacy)
- Previous hospitalization history
- BMI and lifestyle factors

### Emergency Detection
Real-time analysis of vital signs:
- Blood pressure (systolic/diastolic)
- Heart rate
- Oxygen saturation (SpO2)
- Body temperature
- Respiratory rate

### Readmission Risk
30-day readmission probability based on:
- Previous admission frequency
- Chronic condition burden
- Recent discharge timing
- Medication complexity
- Follow-up compliance

## 🐳 Docker Configuration

```yaml
Services:
  - db:       PostgreSQL 15
  - backend:  Node.js API (port 5000)
  - frontend: React + Nginx (port 80)
```

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Backend port | `5000` |
| `DB_HOST` | PostgreSQL host | `localhost` |
| `DB_NAME` | Database name | `hospital_db` |
| `DB_USER` | Database user | `hms_user` |
| `DB_PASSWORD` | Database password | *(required)* |
| `JWT_SECRET` | JWT signing secret | *(required)* |
| `JWT_EXPIRES_IN` | Token expiry | `24h` |
| `FRONTEND_URL` | CORS allowed origin | `http://localhost:3000` |

## 📊 Test Results

```
Test Suites: 4 passed, 4 total
Tests:       33 passed, 33 total

✓ Health Risk Prediction (AI)
✓ Appointment Optimization (AI)
✓ Helper Functions
✓ Auth API (Integration)
```

## 📄 License

MIT License – see [LICENSE](LICENSE) for details.
