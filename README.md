# Book’d — Role-Based Library Management System

> **MERN Evaluation Project**
> Built by **Kanish, Harshit, Naisha & Harman**.

**Book’d** is a warm, editorial library and archival circulation management system featuring strict role-based access control (Patron/Member, Librarian, and Administrator). Designed with independent bookshop aesthetics, paper textures, and typographic elegance.

---

## 📚 Key Features & Demo Scope

### Core
- **Public & Member Catalogue (`/catalogue`)**: Catalogue browsing with search (title, author, ISBN), category filtering, real-time availability badges, grid/list view toggles, and archival detail drawer. Staff can acquire new titles or edit existing records.
- **Member Personal Ledger (`/dashboard`)**: Loan dashboard displaying active checkouts, elapsed days, overdue fine liabilities calculated by the backend, loan history, and a 1-click **Renew** button (+14 days extension).
- **Librarian Circulation Desk (`/librarian`)**: High-density circulation tool for rapid book checkout and return intake, active loans register, and overdue patron tracking.
- **Administrator Analytics (`/reports`)**: Executive telemetry powered by Recharts (most-issued titles, circulation velocity area chart, discipline distribution donut chart, and overdue borrower liabilities).
- **Holds & Reservations (`/reservations`)**: Queue position tracking (#1, #2 in line) and ready-for-pickup notifications.
- **Fine Settlement (`/fines`)**: Itemized per-day overdue penalties breakdown (₹5/day) with a simulated checkout modal and a downloadable official PDF receipt.
- **Access Control & Error States**: Role-guarded routes with custom 403 Forbidden screens and responsive layouts down to mobile.

### Frontend additions
- **Member Registration (`/register`)**: Validated sign-up form (name, email, department, password with confirmation). The client never sends a role; the server must default new accounts to `member`.
- **Live Patron Lookup**: The librarian desk loads members from `GET /api/users` instead of hardcoded data, with loading, error and empty states.
- **ISBN Auto-fill**: The Add Book modal fills title, author, category, cover, year and pages from an ISBN, with loading and not-found handling and a cover preview. Live mode calls `GET /api/books/lookup/:isbn`; mock mode queries the public Open Library API directly.
- **PDF Documents (jsPDF)**: Official fine receipt (transaction ID, date, breakdown, PAID stamp) from the Fines page, and a book issue slip from the member dashboard. PDFs print `Rs.` because jsPDF's built-in fonts cannot render the ₹ glyph.
- **Circulation Tools**: Sortable columns on the circulation register and the member loan history, CSV export from the circulation register (respects the active filter, so the Overdue filter exports the overdue register), and a **Recommended for You** carousel built from the categories a member borrows most.

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
  - jsPDF (PDF receipts and issue slips)
  - Lucide React (minimalist iconography)
  - Google Fonts: *Fraunces* (display serif) + *Figtree* (body sans with tabular numbers)
- **Backend (`server/`)**:
  - Node.js & Express (ES Modules)
  - CORS & JSON parsing
  - In-memory repository pattern behind `repositories/` layer (ready to drop in MongoDB next evaluation)
  - Clear TODO files for JWT authentication, role guards, and fine logic.

---

## 🗂️ Client Structure

```
client/src/
├── api/          # Axios services (mock + live branches in each file)
├── components/   # Shared UI (BookCover, BookModal, SortableTh, ...)
├── context/      # AuthContext (login, register, session)
├── mock/         # Realistic mock data for standalone demo
├── pages/        # Route-level screens
└── utils/        # receipt.js (PDF), csv.js, recommendations.js, useSortableData.js
```

Every API service reads `VITE_USE_MOCK` and either returns mock data or calls the Express server, so the whole client can be demoed without the backend.

---

## 👥 Demo Evaluation Accounts

All accounts use the password: **`demo1234`**

| Role | Email | Password | Patron Name | Access Scope |
| :--- | :--- | :--- | :--- | :--- |
| **Member** | `member@bookd.test` | `demo1234` | Kanish | Catalogue, Personal Loans, Holds, Pay Fines |
| **Librarian** | `librarian@bookd.test` | `demo1234` | Naisha | Catalogue, Book Management, Circulation Desk |
| **Admin** | `admin@bookd.test` | `demo1234` | Dr. Arvind Patel | Full Clearance + Analytics & Reports |

> 💡 **Demo Shortcut**: You can also use the **Demo Role Switcher** bar at the very top of the navigation bar to switch identities in 1-click without re-logging in!

New members can also self-register at `/register`.

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
- Client only (mock mode works without the backend):
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

## 🔌 Backend Endpoints Required by the Client

These two endpoints are used by the frontend additions. In mock mode the client works without them.

| Endpoint | Used by | Access |
| :--- | :--- | :--- |
| `GET /api/users` | Librarian desk patron dropdown | Librarian / Admin |
| `GET /api/books/lookup/:isbn` | Add Book modal auto-fill | Librarian / Admin |

Expected lookup response:
```json
{ "title": "", "author": "", "category": "", "coverUrl": "", "publicationYear": 0, "pages": 0 }
```

Registration must never trust a `role` from the client payload; new accounts default to `member`.

---

## Running in live mode (real Express backend)

Windows / PowerShell notes: PowerShell blocks `npm.ps1`, so always call **`npm.cmd`**. In PowerShell `curl` is an alias for `Invoke-WebRequest`, so use `Invoke-RestMethod` for manual calls.

1. Install everything once: `npm.cmd run install:all`
2. Create the env files (they are gitignored; the `.env.example` files are committed):
   - `server/.env` -> `PORT=5000`, `CLIENT_URL=http://localhost:5173`, `JWT_SECRET=<any string>`
   - `client/.env` -> `VITE_USE_MOCK=false` and `VITE_API_URL=http://localhost:5000/api`
3. Start both apps from the repo root: `npm.cmd run dev` (restart the client after changing `client/.env`).
4. Demo accounts (password `demo1234`): `member@bookd.test` (Kanish), `librarian@bookd.test` (Naisha), `admin@bookd.test` (Dr. Patel). The login-page buttons also send `kanish@bookd.test` / `naisha@bookd.test` / `patel@bookd.test`; the server maps these aliases.
5. Data lives in memory and resets whenever the server restarts. If the browser still holds a mock-mode token, log out (or clear `bookd_token` in localStorage) once.
6. Automated check against a **freshly started** server: `npm.cmd --prefix server run test:e2e`

---

## 📖 Evaluation Handover Notes
- See [API.md](API.md) for the exact REST API schema, request/response JSON shapes, and status codes.
- See [HANDOVER.md](HANDOVER.md) for live vs. mock page classification, Naisha's server TODO list, and design decisions.
