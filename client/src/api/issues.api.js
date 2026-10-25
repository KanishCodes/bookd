import { apiClient, isMockMode, mockDelay } from './client.js';
import { mockState } from '../mock/index.js';

/**
 * Issues / Circulation API Service
 * Contract:
 * - POST  /api/issues { bookId, userId }
 * - PATCH /api/issues/:id/return
 * - PATCH /api/issues/:id/renew
 * - GET   /api/issues/mine
 * - GET   /api/issues
 */

export const issueBook = async ({ bookId, userId }) => {
  if (isMockMode()) {
    await mockDelay(null, 250);

    const book = mockState.books.find((b) => b.id === bookId);
    if (!book) {
      const err = new Error('Book not found');
      err.response = { status: 404, data: { message: 'Book not found' } };
      throw err;
    }

    if (book.availableCopies <= 0) {
      const err = new Error('No available copies remaining for this title');
      err.response = { status: 400, data: { message: 'No available copies remaining for this title' } };
      throw err;
    }

    const user = mockState.users.find((u) => u.id === userId) || {
      id: userId,
      name: 'Library Member',
      email: 'member@univ.edu',
      memberId: 'MEM-000'
    };

    const now = new Date();
    const dueDate = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000);

    const newIssue = {
      id: `iss-${Date.now()}`,
      bookId: book.id,
      bookTitle: book.title,
      bookAuthor: book.author,
      userId: user.id,
      userName: user.name,
      userEmail: user.email,
      memberId: user.memberId,
      issuedAt: now.toISOString(),
      dueAt: dueDate.toISOString(),
      returnedAt: null,
      renewCount: 0,
      fineAmount: 0,
      status: 'ACTIVE'
    };

    mockState.issues.unshift(newIssue);
    // Decrease book copies
    book.availableCopies = Math.max(0, book.availableCopies - 1);
    // Update user stats
    user.activeIssuesCount = (user.activeIssuesCount || 0) + 1;

    return newIssue;
  }

  const response = await apiClient.post('/issues', { bookId, userId });
  return response.data;
};

export const returnBook = async (id) => {
  if (isMockMode()) {
    await mockDelay(null, 250);

    const issue = mockState.issues.find((iss) => iss.id === id);
    if (!issue) {
      const err = new Error('Issue record not found');
      err.response = { status: 404, data: { message: 'Issue record not found' } };
      throw err;
    }

    const now = new Date().toISOString();
    issue.returnedAt = now;
    issue.status = 'RETURNED';

    // Increase book copy
    const book = mockState.books.find((b) => b.id === issue.bookId);
    if (book) {
      book.availableCopies = Math.min(book.totalCopies, book.availableCopies + 1);
    }

    // Decrement user active count
    const user = mockState.users.find((u) => u.id === issue.userId);
    if (user && user.activeIssuesCount > 0) {
      user.activeIssuesCount -= 1;
    }

    return issue;
  }

  const response = await apiClient.patch(`/issues/${id}/return`);
  return response.data;
};

export const renewBook = async (id) => {
  if (isMockMode()) {
    await mockDelay(null, 250);

    const issue = mockState.issues.find((iss) => iss.id === id);
    if (!issue) {
      const err = new Error('Issue record not found');
      err.response = { status: 404, data: { message: 'Issue record not found' } };
      throw err;
    }

    if (issue.returnedAt) {
      const err = new Error('Cannot renew an already returned loan');
      err.response = { status: 400, data: { message: 'Cannot renew an already returned loan' } };
      throw err;
    }

    if (issue.renewCount >= 2) {
      const err = new Error('Maximum renewal limit (2 times) reached for this loan');
      err.response = { status: 400, data: { message: 'Maximum renewal limit (2 times) reached for this loan' } };
      throw err;
    }

    const currentDue = new Date(issue.dueAt);
    const newDue = new Date(currentDue.getTime() + 14 * 24 * 60 * 60 * 1000);

    issue.dueAt = newDue.toISOString();
    issue.renewCount += 1;
    issue.status = new Date() > newDue ? 'OVERDUE' : 'ACTIVE';
    if (issue.status === 'ACTIVE') {
      issue.fineAmount = 0;
    }

    return issue;
  }

  const response = await apiClient.patch(`/issues/${id}/renew`);
  return response.data;
};

export const getMyIssues = async () => {
  if (isMockMode()) {
    await mockDelay(null, 200);

    // Filter by logged-in user or default member Kanish Sharma (u-1)
    let currentUserId = 'u-1';
    const storedUser = localStorage.getItem('bookd_user');
    if (storedUser) {
      try {
        currentUserId = JSON.parse(storedUser).id;
      } catch (e) {
        // Fallback to u-1
      }
    }

    return mockState.issues.filter((iss) => iss.userId === currentUserId);
  }

  const response = await apiClient.get('/issues/mine');
  return response.data;
};

export const getAllIssues = async ({ status } = {}) => {
  if (isMockMode()) {
    await mockDelay(null, 200);
    let result = [...mockState.issues];
    if (status && status !== 'ALL') {
      result = result.filter((iss) => iss.status.toUpperCase() === status.toUpperCase());
    }
    return result;
  }

  const response = await apiClient.get('/issues', {
    params: { status }
  });
  return response.data;
};
