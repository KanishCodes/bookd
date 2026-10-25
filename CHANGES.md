# CHANGES

Backend completion pass on branch `naisha/backend-setup`. Everything below was run against a live server (Node 22 on Linux); see "Not verified" at the bottom.

## Root cause of the "server not reachable" crash
`server/src/routes/fineRoutes.js` imports `../controllers/fineController.js`, but the file was saved as **`fineContoller.js`** (typo). Node threw `ERR_MODULE_NOT_FOUND` at startup, so nothing listened on port 5000. Reproduced, then fixed by renaming the file. No client imports were found in any server file and no server code in client files.

## Server - fixed
| File | Change |
| :--- | :--- |
| `server/src/controllers/fineContoller.js` -> `fineController.js` | Renamed (the crash fix). |
| `server/package.json`, `server/package-lock.json` | Removed accidental self-dependency `"bookd-monorepo": "file:.."` (created by an `npm install` run from the wrong folder). Added script `test:e2e`. |
| `server/src/repositories/issueRepository.js` | Seed loans are cloned (they were mutated in place); ids made collision-proof (`iss-<ts>-<n>`); create/return/renew now return the enriched record so `status`/`fineAmount` are always current. |
| `server/src/repositories/bookRepository.js` | Seed books cloned; collision-proof new ids. |
| `server/src/repositories/reservationRepository.js` | Collision-proof ids. |
| `server/src/repositories/userRepository.js` | Added `getAll()` (used by the summary report). |
| `server/src/repositories/fineRepository.js` | Seed loan `iss-1012` (returned late, seed comment says "Paid 20 fine") is treated as already settled, otherwise it showed up as an outstanding fine and was double counted in `totalCollected`. |
| `server/src/controllers/reportController.js` | Added `getSummaryReport` (see below). |
| `server/src/routes/reportRoutes.js` | Added admin-only `GET /api/reports/summary`. |

## Server - added / verified from your last session (rebuilt and tested)
`utils/fines.js` (`getOverdueDays`), `repositories/fineRepository.js`, `controllers/fineController.js`, `routes/fineRoutes.js`, `repositories/reservationRepository.js`, `controllers/reservationController.js`, `routes/reservationRoutes.js`, `index.js` mounts, issue->reservation hooks (`fulfill` on issue, `markNextReady` on return), popular-books and fines reports. Logic was kept as written; only the fixes in the tables above were needed.

## New file
- `server/test/e2e.mjs` - 128 checks, plain Node `fetch`, no new dependencies. Run with `npm.cmd --prefix server run test:e2e` against a freshly started server (it mutates in-memory data).

## Client - changed (live-mode mismatches)
Silent mock fallbacks found in live mode, all fixed so a failed call now surfaces an error instead of pretending to succeed:
| File | Problem | Fix |
| :--- | :--- | :--- |
| `client/src/api/fines.api.js` | `getFines` returned mock fines on ANY error; `payFine` returned a fake success receipt on ANY error (even 403/404). | Removed both try/catch fallbacks. |
| `client/src/api/reservations.api.js` | `getReservations` returned mock data on error; `cancelReservation` and `createReservation` returned `{success:true}` on error. | Removed all three fallbacks. |
| `client/src/api/reports.api.js` | Live `getReportsSummary` hard-coded totals (32 books, 138 copies, 8 loans...), and took `categoryDistribution` and `overdueMembers` from mock data. | Now calls the new `GET /api/reports/summary` plus `/popular` and `/fines`. |
| `client/src/pages/FinePaymentPage.jsx`, `ReservationsPage.jsx`, `CataloguePage.jsx` | Generic "Payment processing error" / "Failed to cancel" / "Failed to place reservation" hid the server's message. | Show `err.response.data.message` when present. |
| `client/package.json`, `client/package-lock.json` | Same accidental `bookd-monorepo` self-dependency. | Removed. |

(`client/src/context/AuthContext.jsx` real-login `switchDemoRole` was already correct and is unchanged.)

## Contract additions (documented in API.md)
`GET /api/reports/summary` (admin) is an extension; the three contract report endpoints are unchanged. Reservations and fines are now fully specified in API.md.

## Docs
`README.md` gained "Running in live mode"; `API.md` documents reservations, fines and the summary endpoint; this file.

## Behaviour worth knowing
- Seed loan dates are fixed in Oct 2026 and fines are computed from the real clock, so overdue amounts change every day (and nothing is overdue if the PC clock is before those dates).
- Paying a fine on a loan that is still unreturned settles only what has accrued so far; more can accrue afterwards.
- Members cannot read other members' fines or reservations even by passing `?userId=` / `userId` in the body.

## Not verified
- No browser was available: the UI itself (clicking through the pages) has NOT been exercised. I verified the API the pages call, and that the client compiles with `VITE_USE_MOCK=false` (`vite build` in a clean copy).
- Tested on Linux with Node 22, not Windows/PowerShell/Node 24. `npm.cmd`, `Invoke-RestMethod` and the root `npm.cmd run dev` (concurrently + nodemon) were not run here.
- Known remaining client coupling, left alone: the Librarian Desk borrower dropdown reads `MOCK_USERS` from the client, so newly registered users do not appear there (the 16 seeded user ids do match the server).
- CORS was only reasoned about (origin = `CLIENT_URL`), not tested from a real browser.
