# Unolo Field Force Tracker

A web application for tracking field employee check-ins at client locations.

## Tech Stack

- **Frontend:** React 18, Vite, Tailwind CSS, React Router
- **Backend:** Node.js, Express.js, SQLite
- **Authentication:** JWT

## Quick Start

### 1. Backend Setup

```bash
cd backend
npm run setup    # Installs dependencies and initializes database
cp .env.example .env
npm run dev
```

Backend runs on: `http://localhost:3001`

### 2. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Frontend runs on: `http://localhost:5173`

### Test Credentials

| Role     | Email              | Password    |
|----------|-------------------|-------------|
| Manager  | manager@unolo.com | password123 |
| Employee | rahul@unolo.com   | password123 |
| Employee | priya@unolo.com   | password123 |

## Project Structure

```
├── backend/
│   ├── config/          # Database configuration
│   ├── middleware/      # Auth middleware
│   ├── routes/          # API routes
│   ├── scripts/         # Database init scripts
│   └── server.js        # Express app entry
├── frontend/
│   ├── src/
│   │   ├── components/  # Reusable components
│   │   ├── pages/       # Page components
│   │   └── utils/       # API helpers
│   └── index.html
└── database/            # SQL schemas (reference only)
```

## API Endpoints

### Authentication
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Get current user

### Check-ins
- `GET /api/checkin/clients` - Get assigned clients
- `POST /api/checkin` - Create check-in
- `PUT /api/checkin/checkout` - Checkout
- `GET /api/checkin/history` - Get check-in history
- `GET /api/checkin/active` - Get active check-in

### Dashboard
- `GET /api/dashboard/stats` - Manager stats
- `GET /api/dashboard/employee` - Employee stats

## Notes

- The database uses SQLite - no external database setup required
- Run `npm run init-db` to reset the database to initial state


## --------- Changes Done After Downloading Starter Code -----------------------------------##


## Environment Setup

- The project uses Node.js v20 (LTS) for stability.
- Newer Node versions (v22+) caused native dependency issues with better-sqlite3, so Node LTS was used to ensure a smooth setup.


## Database Schema Updated for Compatability

- The original schema provided was MySQL-specific.
- The backend in this setup uses SQLite (file-based database).
- As part of setup, the schema was converted to SQLite-compatible syntax, including:
  - AUTO_INCREMENT → INTEGER PRIMARY KEY AUTOINCREMENT
  - ENUM → TEXT with CHECK constraint
  - VARCHAR / DECIMAL → TEXT / REAL
  - Removed CREATE DATABASE and USE statements


## Database Reset & Initialization Strategy
 - For local development and testing, the project uses a full reset-and-reinitialize database strategy to ensure a clean and predictable setup.
 
 -Disable foreign key checks temporarily
Foreign key constraints are turned off to allow tables to be dropped safely, regardless of dependency order.

Drop all existing tables
All user-defined tables in the SQLite database are removed. SQLite’s internal system tables are preserved.

Re-enable foreign key enforcement
Foreign key checks are turned back on to maintain data integrity for newly created tables.

Load database schema
The schema is applied by executing the SQL in schema.sql, recreating all required tables.

Load seed data
Initial data from seed.sql is inserted to provide a ready-to-use local environment (e.g., test users, clients, assignments).

## This reset-and-reinitialize approach simplifies setup, removes ambiguity during development, and ensures anyone running the project locally starts with the same database state

