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

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL 15+
- Docker (optional)

### Option 1: Docker Compose (Recommended)

```bash
# Clone the repository
git clone https://github.com/vishalgiri2612/hospital-management-ai.git
cd hospital-management-ai

# Copy and edit environment variables
cp backend/.env.example backend/.env
# Edit backend/.env with your settings

# Build and start all services
docker compose up -d

# Access the app
# Frontend: http://localhost
# Backend API: http://localhost:5000
# API Docs: http://localhost:5000/api-docs
```

### Option 2: Manual Setup

#### Backend Setup
```bash
cd backend

# Install dependencies
npm install

# Copy environment file and configure
cp .env.example .env
# Edit .env with your database credentials and JWT secrets

# Run database migrations and seed (if available)
# npx sequelize-cli db:migrate
# npx sequelize-cli db:seed:all

# Start development server
npm run dev

# Backend runs at: http://localhost:5000
# API Docs: http://localhost:5000/api-docs
```

#### Frontend Setup
```bash
cd frontend

# Install dependencies
npm install

# Copy and configure environment
cp .env.example .env

# Start development server
npm start

# Frontend runs at: http://localhost:3000
```

### Running Tests
```bash
cd backend
npm test           # Run all tests
npm run test:unit  # Unit tests only
npm run test:integration  # Integration tests only
npm run test:coverage     # With coverage report
```

## 📁 Project Structure

```
hospital-management-ai/
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
