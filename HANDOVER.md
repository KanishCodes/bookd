# Book’d — Handover Documentation

**Prepared by**: Kanish (Frontend Lead)  
**Handover to**: Naisha (Backend Lead) & Evaluation Committee  
**Evaluation Target**: 50–60% Completion for Demo Evaluation  

---

## 1. Page Status Matrix

| Page / Feature | Route | Status | Notes |
| :--- | :--- | :--- | :--- |
| **Landing Page** | `/` | **LIVE-READY** | Main editorial entry page. Shows curated highlights, system features, and 1-click evaluation profile launchers. |
| **Login Page** | `/login` | **LIVE-READY** | Wired to `client/src/api/auth.api.js`. Has 1-click fill buttons for 3 demo accounts. Redirects to `/catalogue`. |
| **Catalogue & Search** | `/catalogue` | **LIVE-READY** | Wired to `client/src/api/books.api.js`. Supports search, category filter, availability filter, grid/list view, book detail drawer, and staff Add/Edit/Delete. |
| **Member Dashboard** | `/dashboard` | **LIVE-READY** | Wired to `client/src/api/issues.api.js`. Live loans, days left, overdue badge, fine amount from API, and 1-click **Renew** button (+14 days). |
| **Librarian Desk** | `/librarian` | **LIVE-READY** | Wired to `client/src/api/issues.api.js` & `books.api.js`. Fast 1-click book checkout, return processing, active loans table with overdue filter. |
| **Admin Reports & Charts**| `/reports` | **MOCK-READY** | Recharts bar charts (most issued), area chart (circulation trends), and donut chart (disciplines). |
| **Book Reservations** | `/reservations` | **MOCK-READY** | Queue position tracking, hold cancellations, and ready-for-pickup notices. |
| **Fine Payments** | `/fines` | **MOCK-READY** | Itemized overdue breakdown and simulated checkout receipt. |
| **Forbidden (403)** | `/403` | **LIVE-READY** | Rendered automatically by `ProtectedRoute` on insufficient privileges. Has instant role switcher. |
| **Not Found (404)** | `*` | **LIVE-READY** | Clean archival 404 page. |

---

## 2. Functions Naisha Must Verify Against Live Endpoints

When you switch off mock mode (`VITE_USE_MOCK=false`), verify that your Express endpoints return the expected shape in `API.md` for these functions:

### In `client/src/api/auth.api.js`:
1. `login({ email, password })`:
   - Calls `POST /api/auth/login`.
   - Expects `{ token: string, user: { id, name, email, role, memberId } }`.
2. `getMe()`:
   - Calls `GET /api/auth/me`.
   - Expects `{ user: { id, name, email, role, memberId, ... } }`.

### In `client/src/api/books.api.js`:
3. `getBooks({ search, category, available })`:
   - Calls `GET /api/books?search=...&category=...&available=...`.
   - Expects array of Book objects.
4. `getBookById(id)`:
   - Calls `GET /api/books/:id`.
5. `createBook(bookData)`:
   - Calls `POST /api/books`.
6. `updateBook(id, bookData)`:
   - Calls `PUT /api/books/:id`.
7. `deleteBook(id)`:
   - Calls `DELETE /api/books/:id`.

### In `client/src/api/issues.api.js`:
8. `getMyIssues()`:
   - Calls `GET /api/issues/mine`.
   - Must return array of loans for the authenticated patron.
9. `getAllIssues({ status })`:
   - Calls `GET /api/issues?status=...`.
   - Must return array of loans for librarian/admin desk.
10. `issueBook({ bookId, userId })`:
    - Calls `POST /api/issues`.
    - Must decrement `book.availableCopies` and set `status: "ACTIVE"`.
11. `returnBook(id)`:
    - Calls `PATCH /api/issues/:id/return`.
    - Must set `returnedAt: ISOString`, increment `book.availableCopies`, calculate `fineAmount`.
12. `renewBook(id)`:
    - Calls `PATCH /api/issues/:id/renew`.
    - Must check `renewCount < 2`, extend `dueAt` by +14 days, increment `renewCount`.

---

## 3. Naisha's Backend TODO List

All server files have already been scaffolded with clear `// TODO: NAISHA` instructions:

1. **`server/src/middleware/auth.js`**:
   - Install `jsonwebtoken` (or use existing ES module verification).
   - Verify `Authorization: Bearer <token>` in `authenticate`.
   - Implement `requireRole(allowedRoles)` to reject unprivileged roles with `403`.
2. **`server/src/controllers/authController.js`**:
   - Sign JWT on valid email/password login.
   - Return authenticated user in `getMe`.
3. **`server/src/controllers/issueController.js`**:
   - Verify user role and issue volume in `issueBook`.
   - Verify fine amount on return in `returnBook`.
   - Enforce max 2 renewals in `renewBook`.
4. **`server/src/utils/fines.js`**:
   - Fine formula is provided: `(diffDays * 5 INR/day)`. Ensure this is attached to all overdue loan responses so the UI never calculates fines client-side.
5. **`server/src/controllers/reportController.js`**:
   - Query in-memory repository to calculate overdue counts and most borrowed books.

---

## 4. Sensible Decisions Made Without Asking

1. **Top Demo Switcher Pill in Navbar**:
   - Added an evaluation demo identity switcher directly in the navbar header (`[Member (Kanish)] [Librarian (Naisha)] [Admin (Dr. Patel)]`).
   - During the demo presentation tomorrow, you can switch identities in 1 click to show professors how menus, allowed pages, and 403 access control adapt dynamically!
2. **Interactive Mock State Clones**:
   - In mock mode (`VITE_USE_MOCK=true`), operations (issuing a book, returning a book, renewing a book, adding a new book, paying a fine) update the local memory state so your actions immediately reflect across all pages without needing a page refresh or backend.
3. **Designed Editorial Book Covers**:
   - Rather than empty grey placeholder boxes, a custom `BookCover` component generates physical book-style covers with rich category-specific color themes, typography, and spine accents.
4. **Fine Calculation Policy**:
   - Default loan duration is **14 days**.
   - Standard fine rate is **₹5 per day overdue**.
   - Maximum fine cap is **₹500**.
   - Maximum renewals allowed is **2 times**.
5. **Design System & Typography**:
   - Display serif: **Fraunces** with soft wonk axis for a warm, independent bookshop feel.
   - Body sans: **Figtree** with tabular numbers enabled for accurate financial and inventory alignment.
   - Custom palette: Merino `#F5EEDD` (paper), Rock Blue `#84B3CE` (secondary/accents), Venice Blue `#16587B` (primary/headers), Warm Red `#C84B31` (overdue/alerts), Sage `#3E7B54` (in stock).

---

## 5. How to Flip `VITE_USE_MOCK` Off

When Naisha is ready with the live backend endpoints:

1. Open `client/.env` (or copy from `client/.env.example`).
2. Change:
   ```env
   VITE_USE_MOCK=false
   VITE_API_URL=http://localhost:5000/api
   ```
3. Restart the client dev server:
   ```bash
   npm run dev
   ```
4. Now all network requests in `client/src/api/` will dispatch live Axios calls to `http://localhost:5000/api` with Bearer tokens attached!
