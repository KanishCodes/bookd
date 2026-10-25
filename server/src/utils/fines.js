/**
 * Fine Calculation Utility
 * Standard library policy:
 * - 14-day borrowing duration
 * - Grace period: 0 days
 * - Fine rate: 5 INR per day overdue
 * - Maximum fine cap: 500 INR per issue
 */

export const FINE_RATE_PER_DAY = 5;
export const MAX_FINE_CAP = 500;

export const calculateFine = (dueAtString, returnedAtString = null) => {
  if (!dueAtString) return 0;

  const dueDate = new Date(dueAtString);
  const endDate = returnedAtString ? new Date(returnedAtString) : new Date();

  // If returned before or on due date, no fine
  if (endDate <= dueDate) {
    return 0;
  }

  const diffMs = endDate.getTime() - dueDate.getTime();
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  const totalFine = Math.min(diffDays * FINE_RATE_PER_DAY, MAX_FINE_CAP);
  return totalFine;
};

export const getIssueStatus = (dueAtString, returnedAtString = null) => {
  if (returnedAtString) return 'RETURNED';
  const dueDate = new Date(dueAtString);
  const now = new Date();
  return now > dueDate ? 'OVERDUE' : 'ACTIVE';
};
