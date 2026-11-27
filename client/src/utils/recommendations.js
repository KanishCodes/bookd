/**
 * Category-based recommendations.
 * Ranks the categories a member borrows from most, then suggests available titles
 * from those categories that the member has not borrowed yet.
 */
export const getRecommendations = ({ issues = [], books = [], limit = 6 }) => {
  const bookById = new Map(books.map((b) => [b.id, b]));
  const borrowedIds = new Set(issues.map((iss) => iss.bookId));

  const categoryCount = {};
  issues.forEach((iss) => {
    const book = bookById.get(iss.bookId);
    if (!book) return;
    categoryCount[book.category] = (categoryCount[book.category] || 0) + 1;
  });

  if (Object.keys(categoryCount).length === 0) return [];

  return books
    .filter(
      (b) => categoryCount[b.category] && !borrowedIds.has(b.id) && b.availableCopies > 0
    )
    .sort(
      (a, b) =>
        categoryCount[b.category] - categoryCount[a.category] ||
        b.availableCopies - a.availableCopies
    )
    .slice(0, limit);
};