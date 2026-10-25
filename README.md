# Book’d — Role-Based Library Management System

> **MERN Evaluation Project (Evaluation Target: 50–60% Completion)**  
> Built by **Kanish** (UI / Frontend Lead) and **Naisha** (Backend / API Lead).

**Book’d** is a warm, editorial library and archival circulation management system featuring strict role-based access control (Patron/Member, Librarian, and Administrator). Designed with independent bookshop aesthetics, paper textures, and typographic elegance.

---

## 📚 Key Features & Demo Scope

- **Public & Member Catalogue (`/catalogue`)**: Live-wired catalogue browsing with search (title, author, ISBN), category filtering, real-time availability badges, grid/list view toggles, and archival detail drawer. Staff can acquire new titles or edit existing records.
- **Member Personal Ledger (`/dashboard`)**: Live-wired loan dashboard displaying active checkouts, elapsed days, overdue fine liabilities calculated by the backend, loan history, and a 1-click **Renew** button (+14 days extension).
- **Librarian Circulation Desk (`/librarian`)**: High-density circulation tool for rapid 1-click book checkout and return intake, active loans register, and overdue patron tracking.
- **Administrator Analytics (`/reports`)**: Executive telemetry powered by Recharts (most-issued titles, circulation velocity area chart, discipline distribution donut chart, and overdue borrower liabilities).
- **Holds & Reservations (`/reservations`)**: Queue position tracking (#1, #2 in line) and ready-for-pickup notifications.
- **Fine Settlement (`/fines`)**: Itemized per-day overdue penalties breakdown (₹5/day) with simulated checkout modal and official digital receipt.
- **Access Control & Error States**: Role-guarded routes with custom 403 Forbidden screens and responsive layouts down to mobile.

---

## 🛠️ Technology Stack

- **Monorepo**: Single repository containing both `client/` and `server/`.
- **Frontend (`client/`)**:
  - React 18
  - Vite
  - React Router v6
  - Tailwind CSS (custom editorial palette: Merino, Rock Blue, Venice Blue, Warm Red, Sage)
  - Axios (with Bearer interceptors & 401 handling)
  - Recharts (visualizations & charts)
  - Lucide React (minimalist iconography)
  - Google Fonts: *Fraunces* (display serif) + *Figtree* (body sans with tabular numbers)
- **Backend (`server/`)**:
  - Node.js & Express (ES Modules)
  - CORS & JSON parsing
  - In-memory repository pattern behind `repositories/` layer (ready to drop in MongoDB next evaluation)
  - Clear TODO files for JWT authentication, role guards, and fine logic.

---

## 👥 Demo Evaluation Accounts

All accounts use the password: **`demo1234`**

| Role | Email | Password | Patron Name | Access Scope |
| :--- | :--- | :--- | :--- | :--- |
| **Member** | `member@bookd.test` | `demo1234` | Kanish | Catalogue, Personal Loans, Holds, Pay Fines |
| **Librarian** | `librarian@bookd.test` | `demo1234` | Naisha | Catalogue, Book Management, Circulation Desk |
| **Admin** | `admin@bookd.test` | `demo1234` | Dr. Arvind Patel | Full Clearance + Analytics & Reports |

> 💡 **Demo Shortcut**: You can also use the **Demo Role Switcher** bar at the very top of the navigation bar to switch identities in 1-click without re-logging in!

---

## 🚀 Quick Start Guide

### 1. Install Dependencies
Run from the root directory:
```bash
npm run install:all
```
*(Installs root concurrently runner, client packages, and server packages in one command)*

### 2. Run Client and Server Together
```bash
npm run dev
```
- **Client Application**: [http://localhost:5173](http://localhost:5173)
- **Express Backend**: [http://localhost:5000](http://localhost:5000)
- **API Health Check**: [http://localhost:5000/api/health](http://localhost:5000/api/health)

### 3. Run Separately (Optional)
- Client only:
  ```bash
  npm run dev:client
  ```
- Server only:
  ```bash
  npm run dev:server
  ```

---

## ⚙️ Environment Variables

### Client (`client/.env`)
```env
# Set to 'true' for standalone evaluation demo with realistic mock data
# Set to 'false' to route calls to the live Express server
VITE_USE_MOCK=true

# Live API base URL
VITE_API_URL=http://localhost:5000/api
```

### Server (`server/.env`)
```env
PORT=5000
CLIENT_URL=http://localhost:5173
JWT_SECRET=bookd_super_secret_jwt_key_demo_evaluation
```

---

## 📖 Evaluation Handover Notes
- See [API.md](API.md) for the exact REST API schema, request/response JSON shapes, and status codes.
- See [HANDOVER.md](HANDOVER.md) for live vs. mock page classification, Naisha's server TODO list, and design decisions.
