# Book’d — API Contract & Specification

This document details the exact contract between the **Book’d** frontend (`client/`) and backend (`server/`). All request and response formats match the implementation in `client/src/api/` and `server/src/`.

---

## 1. Global Conventions

- **Base URL**: `/api`
- **Content-Type**: `application/json`
- **Authorization**: `Bearer <token>` passed in the HTTP `Authorization` header.
- **Error Response Standard**:
  ```json
  {
    "message": "Human-readable description of error"
  }
  ```

---

## 2. Core Entities

### Book Object
```json
{
  "id": "b-101",
  "title": "Structure and Interpretation of Computer Programs",
  "author": "Harold Abelson, Gerald Jay Sussman",
  "isbn": "978-0262510875",
  "category": "Computer Science",
  "coverUrl": "",
  "totalCopies": 4,
  "availableCopies": 2,
  "shelfLocation": "CS-A1-04",
  "publicationYear": 1996,
  "pages": 657,
  "description": "A foundational text on computer programming..."
}
```

### Issue (Loan) Object
```json
{
  "id": "iss-1001",
  "bookId": "b-101",
  "bookTitle": "Structure and Interpretation of Computer Programs",
  "bookAuthor": "Harold Abelson, Gerald Jay Sussman",
  "userId": "u-1",
  "userName": "Kanish Sharma",
  "userEmail": "member@bookd.test",
  "memberId": "MEM-2024-001",
  "issuedAt": "2026-10-10T10:30:00.000Z",
  "dueAt": "2026-10-24T10:30:00.000Z",
  "returnedAt": null,
  "renewCount": 1,
  "fineAmount": 35,
  "status": "OVERDUE"
}
```
*`status` values: `'ACTIVE' | 'OVERDUE' | 'RETURNED'`.*
*Fine amount is always calculated on the server and returned as `fineAmount` in INR (never calculated on the client).*

### User Object
```json
{
  "id": "u-1",
  "name": "Kanish Sharma",
  "email": "member@bookd.test",
  "role": "member",
  "memberId": "MEM-2024-001",
  "department": "Computer Engineering"
}
```
*`role` values: `'member' | 'librarian' | 'admin'`.*

---

## 3. Endpoints

### Authentication (`/api/auth`)

#### `POST /api/auth/login`
- **Access**: Public
- **Request Body**:
  ```json
  {
    "email": "member@bookd.test",
    "password": "demo1234"
  }
  ```
- **Response `200 OK`**:
  ```json
  {
    "token": "jwt_token_string",
    "user": {
      "id": "u-1",
      "name": "Kanish Sharma",
      "email": "member@bookd.test",
      "role": "member",
      "memberId": "MEM-2024-001",
      "department": "Computer Engineering"
    }
  }
  ```
- **Error `401 Unauthorized`**:
  ```json
  { "message": "Invalid email or password" }
  ```

#### `GET /api/auth/me`
- **Access**: Authenticated (`Bearer <token>`)
- **Response `200 OK`**:
  ```json
  {
    "user": {
      "id": "u-1",
      "name": "Kanish Sharma",
      "email": "member@bookd.test",
      "role": "member",
      "memberId": "MEM-2024-001",
      "department": "Computer Engineering",
      "activeIssuesCount": 2,
      "totalFines": 35
    }
  }
  ```

---

### Books (`/api/books`)

#### `GET /api/books`
- **Access**: Public / All authenticated users
- **Query Parameters**:
  - `search` (optional string): matches title, author, or ISBN (case-insensitive substring)
  - `category` (optional string): e.g. `"Computer Science"`, `"Classic Literature"`
  - `available` (optional string): `"true"` for books with `availableCopies > 0`, `"false"` for 0 copies
- **Response `200 OK`**:
  ```json
  [
    {
      "id": "b-101",
      "title": "Structure and Interpretation of Computer Programs",
      "author": "Harold Abelson, Gerald Jay Sussman",
      "isbn": "978-0262510875",
      "category": "Computer Science",
      "totalCopies": 4,
      "availableCopies": 2,
      "shelfLocation": "CS-A1-04",
      "publicationYear": 1996,
      "pages": 657,
      "description": "..."
    }
  ]
  ```

#### `GET /api/books/:id`
- **Access**: Public / All authenticated users
- **Response `200 OK`**: Book object
- **Error `404 Not Found`**: `{ "message": "Book not found" }`

#### `POST /api/books`
- **Access**: Librarian, Admin
- **Request Body**:
  ```json
  {
    "title": "Designing Data-Intensive Applications",
    "author": "Martin Kleppmann",
    "isbn": "978-1449373320",
    "category": "Computer Science",
    "totalCopies": 5,
    "availableCopies": 5,
    "shelfLocation": "CS-B2-11",
    "publicationYear": 2017,
    "pages": 616,
    "description": "..."
  }
  ```
- **Response `201 Created`**: Created Book object

#### `PUT /api/books/:id`
- **Access**: Librarian, Admin
- **Request Body**: Partial or full fields of Book object
- **Response `200 OK`**: Updated Book object

#### `DELETE /api/books/:id`
- **Access**: Librarian, Admin
- **Response `200 OK`**: `{ "message": "Book deleted successfully" }`

---

### Circulation & Issues (`/api/issues`)

#### `POST /api/issues`
- **Access**: Librarian, Admin
- **Request Body**:
  ```json
  {
    "bookId": "b-101",
    "userId": "u-1"
  }
  ```
- **Behavior**:
  - Decrements `book.availableCopies` by 1.
  - Sets `issuedAt` to now, `dueAt` to +14 days.
  - Sets `status` to `"ACTIVE"`, `renewCount` to 0, `fineAmount` to 0.
- **Response `201 Created`**: Created Issue object
- **Error `400 Bad Request`**: `{ "message": "No available copies remaining for this title" }`

#### `PATCH /api/issues/:id/return`
- **Access**: Librarian, Admin
- **Behavior**:
  - Sets `returnedAt` to current ISO timestamp.
  - Increments `book.availableCopies` by 1.
  - Calculates final overdue fine if returned past `dueAt` (₹5/day).
  - Sets `status` to `"RETURNED"`.
- **Response `200 OK`**: Updated Issue object with `returnedAt` and settled `fineAmount`.

#### `PATCH /api/issues/:id/renew`
- **Access**: All authenticated patrons & staff
- **Behavior**:
  - Checks `issue.renewCount < 2`.
  - Extends `dueAt` by +14 days.
  - Increments `renewCount` by 1.
  - Re-evaluates `status` and `fineAmount`.
- **Response `200 OK`**: Updated Issue object
- **Error `400 Bad Request`**: `{ "message": "Maximum renewal limit (2 times) reached for this loan" }`

#### `GET /api/issues/mine`
- **Access**: Member, Librarian, Admin (returns loans for current `req.user.id`)
- **Response `200 OK`**: Array of Issue objects

#### `GET /api/issues`
- **Access**: Librarian, Admin
- **Query Parameters**:
  - `status` (optional string): `"ACTIVE"`, `"OVERDUE"`, `"RETURNED"`
- **Response `200 OK`**: Array of all Issue circulation records

---

### Reports & Analytics (`/api/reports`)

#### `GET /api/reports/overdue`
- **Access**: Admin
- **Response `200 OK`**:
  ```json
  {
    "count": 4,
    "records": [ ...Issue objects where status is OVERDUE... ]
  }
  ```

#### `GET /api/reports/popular`
- **Access**: Admin
- **Response `200 OK`**:
  ```json
  [
    { "title": "Introduction to Algorithms", "issues": 48, "category": "Computer Science" },
    { "title": "Designing Data-Intensive Applications", "issues": 42, "category": "Computer Science" }
  ]
  ```

#### `GET /api/reports/fines`
- **Access**: Admin
- **Response `200 OK`**:
  ```json
  {
    "totalCollected": 1420,
    "totalPending": 265,
    "overdueCount": 4,
    "monthlyBreakdown": [
      { "month": "May", "issues": 78, "returns": 72 },
      { "month": "Oct", "issues": 154, "returns": 139 }
    ]
  }
  ```

---

### Reservations & Fines (Mock Extensions)

#### `GET /api/reservations` | `DELETE /api/reservations/:id` | `POST /api/reservations`
- Provides queue placement, queue position numbers, and hold cancellations.

#### `GET /api/fines?userId=` | `POST /api/fines/:id/pay`
- Provides itemized fine line-items and checkout receipt generation.
