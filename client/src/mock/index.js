import { MOCK_BOOKS } from './books.js';
import { MOCK_USERS } from './users.js';
import { MOCK_ISSUES } from './issues.js';
import { MOCK_RESERVATIONS } from './reservations.js';
import { MOCK_REPORTS } from './reports.js';
import { MOCK_FINES } from './fines.js';

// In-memory clones so user interactions (borrow, return, add book, pay fine) persist during demo session
export let mockState = {
  books: [...MOCK_BOOKS],
  users: [...MOCK_USERS],
  issues: [...MOCK_ISSUES],
  reservations: [...MOCK_RESERVATIONS],
  reports: JSON.parse(JSON.stringify(MOCK_REPORTS)),
  fines: [...MOCK_FINES]
};

export const resetMockData = () => {
  mockState = {
    books: [...MOCK_BOOKS],
    users: [...MOCK_USERS],
    issues: [...MOCK_ISSUES],
    reservations: [...MOCK_RESERVATIONS],
    reports: JSON.parse(JSON.stringify(MOCK_REPORTS)),
    fines: [...MOCK_FINES]
  };
};

export {
  MOCK_BOOKS,
  MOCK_USERS,
  MOCK_ISSUES,
  MOCK_RESERVATIONS,
  MOCK_REPORTS,
  MOCK_FINES
};
