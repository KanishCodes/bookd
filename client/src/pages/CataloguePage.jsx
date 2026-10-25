import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { getBooks, deleteBook } from '../api/books.api.js';
import { createReservation } from '../api/reservations.api.js';
import { BookCover } from '../components/BookCover.jsx';
import { AvailabilityBadge, CategoryTag } from '../components/Badge.jsx';
import { Drawer } from '../components/Drawer.jsx';
import { BookModal } from '../components/BookModal.jsx';
import { LoadingState, EmptyState, ErrorState } from '../components/FeedbackStates.jsx';
import {
  Search,
  X,
  Plus,
  LayoutGrid,
  List,
  BookmarkPlus,
  Edit3,
  Trash2,
  MapPin,
  Barcode,
  Calendar,
  BookOpen,
  CheckCircle2,
  Clock
} from 'lucide-react';

const CATEGORIES = [
  'All',
  'Computer Science',
  'Classic Literature',
  'History & Philosophy',
  'Science & Nature',
  'Art & Architecture',
  'Fiction & Mystery',
  'Poetry'
];

export const CataloguePage = () => {
  const { user, role } = useAuth();
  const isStaff = role === 'librarian' || role === 'admin';

  // Filters state
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [availabilityFilter, setAvailabilityFilter] = useState('ALL'); // 'ALL', 'AVAILABLE', 'BORROWED'
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'list'

  // Books state
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Selected book for Drawer
  const [selectedBook, setSelectedBook] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Modal for Add/Edit book (Staff)
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBook, setEditingBook] = useState(null);

  // Action feedback message
  const [notification, setNotification] = useState('');

  const fetchCatalogue = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      let availParam = '';
      if (availabilityFilter === 'AVAILABLE') availParam = 'true';
      if (availabilityFilter === 'BORROWED') availParam = 'false';

      const data = await getBooks({
        search,
        category: selectedCategory === 'All' ? '' : selectedCategory,
        available: availParam
      });
      setBooks(data);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to fetch catalogue books.');
    } finally {
      setLoading(false);
    }
  }, [search, selectedCategory, availabilityFilter]);

  useEffect(() => {
    // Debounce search slightly
    const timer = setTimeout(() => {
      fetchCatalogue();
    }, 200);
    return () => clearTimeout(timer);
  }, [fetchCatalogue]);

  const handleBookClick = (book) => {
    setSelectedBook(book);
    setIsDrawerOpen(true);
  };

  const handleOpenAddModal = () => {
    setEditingBook(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (book) => {
    setEditingBook(book);
    setIsModalOpen(true);
  };

  const handleDeleteBook = async (bookId) => {
    if (window.confirm('Are you sure you want to retire this book from the active catalogue?')) {
      try {
        await deleteBook(bookId);
        setIsDrawerOpen(false);
        setNotification('Book record deleted successfully.');
        setTimeout(() => setNotification(''), 4000);
        fetchCatalogue();
      } catch (err) {
        alert(err.response?.data?.message || err.message || 'Failed to delete book.');
      }
    }
  };

  const handleReserveBook = async (book) => {
    try {
      await createReservation({ bookId: book.id, userId: user?.id || 'u-1' });
      setNotification(`Reserved "${book.title}". You will be notified when a copy is returned.`);
      setTimeout(() => setNotification(''), 4000);
      setIsDrawerOpen(false);
    } catch (err) {
      alert('Failed to place reservation.');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Toast Notification */}
      {notification && (
        <div className="fixed bottom-6 right-6 z-50 bg-venice-blue text-merino px-4 py-3 rounded shadow-elevated flex items-center gap-2 border border-rock-blue/40 text-sm animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-rock-blue-light" />
          <span>{notification}</span>
        </div>
      )}

      {/* Hero / Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-sand">
        <div>
          <span className="text-xs uppercase tracking-widest small-caps font-sans font-medium text-ink-muted">
            The Archival Collection
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-ink tracking-tight mt-1">
            Library Catalogue
          </h1>
          <p className="text-sm text-ink-muted mt-1 max-w-xl">
            Explore {books.length} curated volumes across sciences, classics, design, and literature. Real-time availability from stack storage.
          </p>
        </div>

        {isStaff && (
          <button
            onClick={handleOpenAddModal}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-venice-blue hover:bg-venice-blue-hover text-merino rounded font-medium text-xs uppercase small-caps tracking-wider transition shadow-sm self-start md:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Acquire New Title</span>
          </button>
        )}
      </div>

      {/* Search & Filter Toolbar */}
      <div className="mt-6 space-y-4">
        {/* Search Bar & View Mode Toggle */}
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
          <div className="relative flex-1 max-w-lg">
            <Search className="w-4 h-4 text-ink-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by title, author, or ISBN..."
              className="w-full pl-10 pr-9 py-2 bg-merino-light border border-sand rounded text-sm text-ink placeholder-ink-muted/60 focus:outline-none focus:border-venice-blue transition"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-muted hover:text-ink"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            {/* Availability Filter Buttons */}
            <div className="inline-flex rounded border border-sand bg-merino-light p-0.5 text-xs">
              <button
                onClick={() => setAvailabilityFilter('ALL')}
                className={`px-3 py-1 rounded transition ${
                  availabilityFilter === 'ALL'
                    ? 'bg-venice-blue text-merino font-medium'
                    : 'text-ink-muted hover:text-ink'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setAvailabilityFilter('AVAILABLE')}
                className={`px-3 py-1 rounded transition ${
                  availabilityFilter === 'AVAILABLE'
                    ? 'bg-venice-blue text-merino font-medium'
                    : 'text-ink-muted hover:text-ink'
                }`}
              >
                Available Now
              </button>
              <button
                onClick={() => setAvailabilityFilter('BORROWED')}
                className={`px-3 py-1 rounded transition ${
                  availabilityFilter === 'BORROWED'
                    ? 'bg-venice-blue text-merino font-medium'
                    : 'text-ink-muted hover:text-ink'
                }`}
              >
                Fully Borrowed
              </button>
            </div>

            {/* View Mode Toggle */}
            <div className="inline-flex rounded border border-sand bg-merino-light p-0.5 text-ink-muted">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded transition ${
                  viewMode === 'grid' ? 'bg-venice-blue text-merino' : 'hover:text-ink'
                }`}
                title="Grid view"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-1.5 rounded transition ${
                  viewMode === 'list' ? 'bg-venice-blue text-merino' : 'hover:text-ink'
                }`}
                title="List view"
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none">
          {CATEGORIES.map((cat) => (
            <CategoryTag
              key={cat}
              category={cat}
              active={selectedCategory === cat}
              onClick={() => setSelectedCategory(cat)}
            />
          ))}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="mt-6">
        {loading ? (
          <LoadingState message="Browsing catalogue shelves..." />
        ) : error ? (
          <ErrorState message={error} onRetry={fetchCatalogue} />
        ) : books.length === 0 ? (
          <EmptyState
            title="No matching volumes"
            description={
              search
                ? `No books found matching "${search}". Try searching by another keyword or reset the category filter.`
                : 'No books match the chosen filters.'
            }
            actionLabel="Reset All Filters"
            onAction={() => {
              setSearch('');
              setSelectedCategory('All');
              setAvailabilityFilter('ALL');
            }}
          />
        ) : viewMode === 'grid' ? (
          /* Grid View */
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {books.map((book) => (
              <div
                key={book.id}
                onClick={() => handleBookClick(book)}
                className="paper-card rounded-md p-4 cursor-pointer hover:border-rock-blue/70 transition-all duration-200 group flex flex-col justify-between"
              >
                <div className="flex gap-4">
                  <BookCover
                    title={book.title}
                    author={book.author}
                    category={book.category}
                    coverUrl={book.coverUrl}
                    size="sm"
                    className="group-hover:scale-[1.02]"
                  />
                  <div className="flex-1 min-w-0">
                    <span className="text-[10px] font-sans small-caps uppercase tracking-wider text-rock-blue-dark block truncate">
                      {book.category}
                    </span>
                    <h3 className="font-serif font-bold text-ink text-sm leading-tight line-clamp-2 mt-0.5 group-hover:text-venice-blue transition">
                      {book.title}
                    </h3>
                    <p className="text-xs text-ink-muted truncate mt-1">
                      {book.author}
                    </p>
                    <div className="flex items-center gap-1 text-[11px] font-mono text-ink-muted/80 mt-2">
                      <MapPin className="w-3 h-3 text-rock-blue" />
                      <span>{book.shelfLocation}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-sand/70 flex items-center justify-between">
                  <AvailabilityBadge
                    availableCopies={book.availableCopies}
                    totalCopies={book.totalCopies}
                  />
                  <span className="text-[10px] font-mono text-ink-muted/60">
                    {book.publicationYear}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* List View */
          <div className="paper-card rounded-md overflow-hidden border border-sand">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="bg-sand/30 border-b border-sand text-xs font-sans small-caps uppercase tracking-wider text-ink-muted">
                    <th className="py-3 px-4">Title & Author</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4">Shelf Location</th>
                    <th className="py-3 px-4">ISBN</th>
                    <th className="py-3 px-4">Availability</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-sand/50">
                  {books.map((book) => (
                    <tr
                      key={book.id}
                      onClick={() => handleBookClick(book)}
                      className="hover:bg-sand/20 cursor-pointer transition"
                    >
                      <td className="py-3 px-4">
                        <div className="font-serif font-semibold text-ink">
                          {book.title}
                        </div>
                        <div className="text-xs text-ink-muted">
                          {book.author} ({book.publicationYear})
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-xs px-2 py-0.5 rounded bg-sand/50 text-venice-blue font-medium small-caps">
                          {book.category}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-mono text-xs text-ink-muted">
                        <span className="inline-flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-rock-blue" />
                          {book.shelfLocation}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-mono text-xs text-ink-muted">
                        {book.isbn}
                      </td>
                      <td className="py-3 px-4">
                        <AvailabilityBadge
                          availableCopies={book.availableCopies}
                          totalCopies={book.totalCopies}
                        />
                      </td>
                      <td className="py-3 px-4 text-right">
                        <span className="text-xs text-venice-blue font-medium group-hover:underline">
                          Inspect →
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Book Detail Drawer */}
      <Drawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        title={selectedBook?.title || 'Book Details'}
        subtitle={`By ${selectedBook?.author} • Published ${selectedBook?.publicationYear}`}
      >
        {selectedBook && (
          <div className="space-y-6">
            {/* Cover and Metadata */}
            <div className="flex gap-5 items-start">
              <BookCover
                title={selectedBook.title}
                author={selectedBook.author}
                category={selectedBook.category}
                coverUrl={selectedBook.coverUrl}
                size="md"
              />
              <div className="flex-1 space-y-2.5">
                <div>
                  <span className="text-[10px] small-caps uppercase tracking-wider text-ink-muted font-sans font-semibold">
                    Category
                  </span>
                  <p className="text-sm font-medium text-venice-blue">
                    {selectedBook.category}
                  </p>
                </div>

                <div>
                  <span className="text-[10px] small-caps uppercase tracking-wider text-ink-muted font-sans font-semibold">
                    Shelf Location
                  </span>
                  <p className="text-sm font-mono text-ink flex items-center gap-1 font-semibold">
                    <MapPin className="w-3.5 h-3.5 text-rock-blue" />
                    {selectedBook.shelfLocation}
                  </p>
                </div>

                <div>
                  <span className="text-[10px] small-caps uppercase tracking-wider text-ink-muted font-sans font-semibold">
                    ISBN
                  </span>
                  <p className="text-xs font-mono text-ink-muted">
                    {selectedBook.isbn}
                  </p>
                </div>

                <div>
                  <span className="text-[10px] small-caps uppercase tracking-wider text-ink-muted font-sans font-semibold">
                    Extent
                  </span>
                  <p className="text-xs text-ink-muted">
                    {selectedBook.pages || '320'} pages
                  </p>
                </div>
              </div>
            </div>

            {/* Availability Status Card */}
            <div className="p-4 rounded-md bg-sand/30 border border-sand space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs small-caps uppercase tracking-wider font-semibold text-ink">
                  Circulation Stock
                </span>
                <AvailabilityBadge
                  availableCopies={selectedBook.availableCopies}
                  totalCopies={selectedBook.totalCopies}
                />
              </div>
              <p className="text-xs text-ink-muted">
                {selectedBook.availableCopies > 0
                  ? `${selectedBook.availableCopies} physical copy(ies) ready for loan at the circulation desk.`
                  : 'All copies are currently borrowed. You may place a queue reservation.'}
              </p>
            </div>

            {/* Synopsis / Description */}
            <div>
              <h4 className="text-xs small-caps uppercase tracking-wider font-semibold text-ink mb-1">
                Archival Synopsis
              </h4>
              <p className="text-sm text-ink/80 leading-relaxed font-sans bg-merino p-3 rounded border border-sand/60">
                {selectedBook.description ||
                  'No synopsis registered in the catalogue database yet.'}
              </p>
            </div>

            {/* Action Buttons */}
            <div className="pt-4 border-t border-sand space-y-2">
              {role === 'member' && (
                <>
                  {selectedBook.availableCopies > 0 ? (
                    <div className="p-3 bg-sage/10 border border-sage/30 rounded text-xs text-sage flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                      <span>
                        In stock! Visit the Circulation Desk with Shelf Code <strong>{selectedBook.shelfLocation}</strong> to borrow.
                      </span>
                    </div>
                  ) : (
                    <button
                      onClick={() => handleReserveBook(selectedBook)}
                      className="w-full py-2.5 px-4 bg-venice-blue hover:bg-venice-blue-hover text-merino rounded text-sm font-medium transition flex items-center justify-center gap-2 shadow-sm"
                    >
                      <BookmarkPlus className="w-4 h-4" />
                      <span>Place Hold / Reserve Book</span>
                    </button>
                  )}
                </>
              )}

              {isStaff && (
                <div className="grid grid-cols-2 gap-2 pt-2">
                  <button
                    onClick={() => {
                      setIsDrawerOpen(false);
                      handleOpenEditModal(selectedBook);
                    }}
                    className="py-2 px-3 border border-sand hover:bg-sand text-venice-blue rounded text-xs uppercase small-caps tracking-wider font-semibold transition flex items-center justify-center gap-1.5"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Edit Record</span>
                  </button>
                  <button
                    onClick={() => handleDeleteBook(selectedBook.id)}
                    className="py-2 px-3 border border-warm-red/30 hover:bg-warm-red/10 text-warm-red rounded text-xs uppercase small-caps tracking-wider font-semibold transition flex items-center justify-center gap-1.5"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Retire Title</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </Drawer>

      {/* Book Create / Edit Modal (Staff) */}
      <BookModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        book={editingBook}
        onSaved={() => {
          fetchCatalogue();
          setNotification(editingBook ? 'Book record updated successfully.' : 'New book added to catalogue.');
          setTimeout(() => setNotification(''), 4000);
        }}
      />
    </div>
  );
};

export default CataloguePage;
