/**
 * Open Library & Google Books ISBN metadata resolution service
 */
export const lookupBookByIsbn = async (isbn) => {
  if (!isbn) {
    throw new Error('ISBN is required');
  }

  const cleanIsbn = isbn.replace(/[^0-9X]/gi, '');
  if (cleanIsbn.length !== 10 && cleanIsbn.length !== 13) {
    throw new Error('Invalid ISBN format. Must be a 10 or 13-digit standard ISBN.');
  }

  // 1. Query Open Library Books API
  try {
    const url = `https://openlibrary.org/api/books?bibkeys=ISBN:${cleanIsbn}&format=json&jscmd=data`;
    const response = await fetch(url, {
      headers: { Accept: 'application/json' },
      signal: AbortSignal.timeout(6000),
    });

    if (response.ok) {
      const data = await response.json();
      const bookData = data[`ISBN:${cleanIsbn}`];

      if (bookData) {
        const authors =
          (bookData.authors || []).map((a) => a.name).join(', ') ||
          bookData.by_statement ||
          'Unknown Author';
        const coverUrl =
          bookData.cover?.large ||
          bookData.cover?.medium ||
          bookData.cover?.small ||
          `https://covers.openlibrary.org/b/isbn/${cleanIsbn}-L.jpg`;
        const category = bookData.subjects?.[0]?.name || 'General';
        const pubYearMatch = bookData.publish_date?.match(/\d{4}/);
        const publicationYear = pubYearMatch
          ? Number(pubYearMatch[0])
          : new Date().getFullYear();

        return {
          source: 'open-library',
          isbn,
          cleanIsbn,
          title: bookData.title,
          author: authors,
          category,
          coverUrl,
          publicationYear,
          pages: bookData.number_of_pages || 0,
          description:
            typeof bookData.notes === 'string'
              ? bookData.notes
              : bookData.subtitle || '',
        };
      }
    }
  } catch (err) {
    console.warn(`[ISBN Service] Open Library query fallback: ${err.message}`);
  }

  // 2. Fallback to Google Books API
  try {
    const gUrl = `https://www.googleapis.com/books/v1/volumes?q=isbn:${cleanIsbn}`;
    const gRes = await fetch(gUrl, { signal: AbortSignal.timeout(6000) });
    if (gRes.ok) {
      const gData = await gRes.json();
      const item = gData.items?.[0]?.volumeInfo;
      if (item) {
        return {
          source: 'google-books',
          isbn,
          cleanIsbn,
          title: item.title,
          author: (item.authors || []).join(', ') || 'Unknown Author',
          category: item.categories?.[0] || 'General',
          coverUrl:
            item.imageLinks?.thumbnail?.replace('http://', 'https://') ||
            `https://covers.openlibrary.org/b/isbn/${cleanIsbn}-L.jpg`,
          publicationYear: item.publishedDate
            ? Number(item.publishedDate.slice(0, 4))
            : new Date().getFullYear(),
          pages: item.pageCount || 0,
          description: item.description || '',
        };
      }
    }
  } catch (err) {
    console.warn(`[ISBN Service] Google Books query fallback: ${err.message}`);
  }

  // 3. Fallback preview
  return {
    source: 'fallback',
    isbn,
    cleanIsbn,
    title: '',
    author: '',
    category: 'General',
    coverUrl: `https://covers.openlibrary.org/b/isbn/${cleanIsbn}-L.jpg`,
    publicationYear: new Date().getFullYear(),
    pages: 0,
    description: '',
  };
};

export default { lookupBookByIsbn };
