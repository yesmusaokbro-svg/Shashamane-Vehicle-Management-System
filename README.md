 # Shashamane Vehicle Management System (SVMS)

A full-stack web application for managing intercity bus transportation in Shashamane, Ethiopia.

## Tech Stack

| Layer      | Technology                          |
|------------|-------------------------------------|
| Frontend   | React 18, Vite, React Router, Recharts, Bootstrap 5 |
| Backend    | Node.js, Express.js, REST API       |
| Database   | MongoDB Atlas, Mongoose             |
| Auth       | JWT (httpOnly cookies), Argon2      |

## Prerequisites

- Node.js v18+ (v24 recommended)
- npm v9+
- MongoDB Atlas account (free tier works)

## Quick Start

### 1. Clone and install

```bash
# Install all dependencies
npm run install:all
```

### 2. Configure environment

```bash
# Copy the example env file
cp .env.example server/.env
```

Edit `server/.env` and set your `MONGODB_URI`:

```
MONGODB_URI=mongodb+srv://<user>:<pass>@<cluster>.mongodb.net/svms?retryWrites=true&w=majority
JWT_SECRET=<generate a 64+ char random string>
```

### 3. Start development servers

Open **two terminals**:

**Terminal 1 — Backend:**
```bash
npm run dev:server
# Starts on http://localhost:5000
# Health check: http://localhost:5000/api/health
```

**Terminal 2 — Frontend:**
```bash
npm run dev:client
# Starts on http://localhost:5173
```

Then open http://localhost:5173 in your browser.

## Project Structure

```
shashamane-vehicle-management/
├── client/              # React + Vite frontend
│   └── src/
│       ├── pages/       # Route-level page components
│       │   ├── auth/    # Login, register, password reset
│       │   ├── admin/   # Admin dashboard and management pages
│       │   ├── dispatcher/
│       │   ├── driver/
│       │   └── passenger/
│       ├── components/  # Reusable UI components
│       ├── services/    # Axios API calls
│       ├── hooks/       # useAuth, useFetch, useNotifications
│       ├── layouts/     # Sidebar, Topbar, DashboardLayout
│       ├── routes/      # ProtectedRoute, AppRoutes
│       ├── styles/      # CSS variables and global styles
│       └── utils/       # Formatters (dates, currency, etc.)
│
├── server/              # Node.js + Express backend
│   ├── config/          # DB connection, constants
│   ├── controllers/     # Request handlers
│   ├── middleware/       # Auth, error handler, validator
│   ├── models/          # Mongoose schemas
│   ├── routes/          # Express route definitions
│   ├── services/        # Business logic (auth, booking, tickets)
│   ├── utils/           # Reference generators, QR codes, pagination
│   ├── validators/      # express-validator chains
│   └── tests/           # Jest test suites
│
├── docs/
├── .env.example
└── README.md
```

## User Roles

| Role       | Access                                              |
|------------|-----------------------------------------------------|
| Admin      | Full system access, user management, all reports    |
| Dispatcher | Schedules, vehicles, drivers, bookings (operational)|
| Driver     | Own trip assignments only                           |
| Passenger  | Search trips, book seats, pay, view tickets         |

## Key Features

- **Secure Auth** — Argon2id password hashing, JWT in httpOnly cookies, rate limiting
- **Seat Reservation** — Atomic MongoDB update prevents double-booking under concurrent load
- **Digital Tickets** — QR codes generated on payment confirmation, printable PDF
- **Role-based UI** — Each role sees a dedicated sidebar and dashboard
- **Real charts** — All dashboard stats from live MongoDB aggregations (Recharts)
- **Maintenance Blocking** — Vehicles under maintenance cannot be scheduled

## API Endpoints

| Resource       | Base URL               |
|----------------|------------------------|
| Auth           | `/api/auth`            |
| Vehicles       | `/api/vehicles`        |
| Drivers        | `/api/drivers`         |
| Routes         | `/api/routes`          |
| Schedules      | `/api/schedules`       |
| Bookings       | `/api/bookings`        |
| Payments       | `/api/payments`        |
| Tickets        | `/api/tickets`         |
| Maintenance    | `/api/maintenance`     |
| Notifications  | `/api/notifications`   |
| Dashboards     | `/api/dashboard`       |
| Health check   | `/api/health`          |

## Running Tests

```bash
# Backend tests (requires MONGODB_URI in server/.env)
npm run test --prefix server
```

Tests cover: auth, validation, protected routes, input rejection.

## Payment Flow (Development)

In development, there is no real payment gateway. The flow is:

1. Passenger selects seat → `POST /api/bookings` → status: `pending`
2. On booking detail page, select payment method and click Pay
3. This calls `POST /api/payments/initiate` then `POST /api/payments/:id/confirm`
4. On confirm: booking → `confirmed`, ticket issued automatically

To integrate a real gateway (e.g. Chapa, Stripe): replace the confirm endpoint with a webhook handler that verifies the transaction before calling `issueTicket()`.

## Security Notes

- Passwords hashed with Argon2id (64MB memory, 3 iterations)
- JWT stored in `httpOnly` + `SameSite` cookie — not accessible from JavaScript
- Rate limiting: 100 req/15min general, 20 req/15min on auth endpoints
- Helmet.js sets secure HTTP response headers
- All role checks enforced server-side — hiding buttons is only UX, not security
- Never expose `MONGODB_URI` or `JWT_SECRET` to the frontend
