import React, { useState, useEffect } from 'react';
import { Modal } from './Modal.jsx';
import { createBook, updateBook } from '../api/books.api.js';

const CATEGORIES = [
  'Computer Science',
  'Classic Literature',
  'History & Philosophy',
  'Science & Nature',
  'Art & Architecture',
  'Fiction & Mystery',
  'Poetry'
];

export const BookModal = ({ isOpen, onClose, book, onSaved }) => {
  const isEditing = !!book;

  const [formData, setFormData] = useState({
    title: '',
    author: '',
    isbn: '',
    category: 'Computer Science',
    totalCopies: 3,
    availableCopies: 3,
    shelfLocation: 'GEN-01',
    publicationYear: new Date().getFullYear(),
    pages: 350,
    description: '',
    coverUrl: ''
  });

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (book) {
      setFormData({
        title: book.title || '',
        author: book.author || '',
        isbn: book.isbn || '',
        category: book.category || 'Computer Science',
        totalCopies: book.totalCopies || 1,
        availableCopies: book.availableCopies || 1,
        shelfLocation: book.shelfLocation || 'GEN-01',
        publicationYear: book.publicationYear || new Date().getFullYear(),
        pages: book.pages || 0,
        description: book.description || '',
        coverUrl: book.coverUrl || ''
      });
    } else {
      setFormData({
        title: '',
        author: '',
        isbn: '',
        category: 'Computer Science',
        totalCopies: 3,
        availableCopies: 3,
        shelfLocation: 'CS-A1-01',
        publicationYear: 2024,
        pages: 320,
        description: '',
        coverUrl: ''
      });
    }
    setError('');
  }, [book, isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.title.trim() || !formData.author.trim() || !formData.isbn.trim()) {
      setError('Title, author, and ISBN are required fields.');
      return;
    }

    setSubmitting(true);
    try {
      if (isEditing) {
        await updateBook(book.id, formData);
      } else {
        await createBook(formData);
      }
      onSaved?.();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to save book record.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'Edit Catalogue Entry' : 'Acquire New Book Title'}
      subtitle={isEditing ? `Catalog ID: ${book?.id}` : 'Add a new title to the permanent library collection'}
      maxWidth="max-w-2xl"
    >
      {error && (
        <div className="mb-4 p-3 bg-warm-red/10 border border-warm-red/25 rounded text-warm-red text-xs">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <label className="block text-xs font-medium text-ink small-caps uppercase tracking-wider mb-1">
              Title *
            </label>
            <input
              type="text"
              name="title"
              required
              value={formData.title}
              onChange={handleChange}
              placeholder="e.g. Designing Data-Intensive Applications"
              className="w-full px-3 py-2 bg-merino-light border border-sand rounded text-sm text-ink focus:outline-none focus:border-venice-blue"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-ink small-caps uppercase tracking-wider mb-1">
              Author(s) *
            </label>
            <input
              type="text"
              name="author"
              required
              value={formData.author}
              onChange={handleChange}
              placeholder="e.g. Martin Kleppmann"
              className="w-full px-3 py-2 bg-merino-light border border-sand rounded text-sm text-ink focus:outline-none focus:border-venice-blue"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-ink small-caps uppercase tracking-wider mb-1">
              ISBN *
            </label>
            <input
              type="text"
              name="isbn"
              required
              value={formData.isbn}
              onChange={handleChange}
              placeholder="e.g. 978-1449373320"
              className="w-full px-3 py-2 bg-merino-light border border-sand rounded text-sm text-ink font-mono focus:outline-none focus:border-venice-blue"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-ink small-caps uppercase tracking-wider mb-1">
              Category
            </label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="w-full px-3 py-2 bg-merino-light border border-sand rounded text-sm text-ink focus:outline-none focus:border-venice-blue"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-ink small-caps uppercase tracking-wider mb-1">
              Shelf Location
            </label>
            <input
              type="text"
              name="shelfLocation"
              value={formData.shelfLocation}
              onChange={handleChange}
              placeholder="e.g. CS-B2-11"
              className="w-full px-3 py-2 bg-merino-light border border-sand rounded text-sm text-ink font-mono focus:outline-none focus:border-venice-blue"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-ink small-caps uppercase tracking-wider mb-1">
              Total Copies
            </label>
            <input
              type="number"
              name="totalCopies"
              min="1"
              value={formData.totalCopies}
              onChange={handleChange}
              className="w-full px-3 py-2 bg-merino-light border border-sand rounded text-sm text-ink focus:outline-none focus:border-venice-blue"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-ink small-caps uppercase tracking-wider mb-1">
              Available Copies
            </label>
            <input
              type="number"
              name="availableCopies"
              min="0"
              max={formData.totalCopies}
              value={formData.availableCopies}
              onChange={handleChange}
              className="w-full px-3 py-2 bg-merino-light border border-sand rounded text-sm text-ink focus:outline-none focus:border-venice-blue"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-ink small-caps uppercase tracking-wider mb-1">
              Publication Year
            </label>
            <input
              type="number"
              name="publicationYear"
              value={formData.publicationYear}
              onChange={handleChange}
              className="w-full px-3 py-2 bg-merino-light border border-sand rounded text-sm text-ink focus:outline-none focus:border-venice-blue"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-ink small-caps uppercase tracking-wider mb-1">
              Page Count
            </label>
            <input
              type="number"
              name="pages"
              value={formData.pages}
              onChange={handleChange}
              className="w-full px-3 py-2 bg-merino-light border border-sand rounded text-sm text-ink focus:outline-none focus:border-venice-blue"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-medium text-ink small-caps uppercase tracking-wider mb-1">
              Archival Description / Synopsis
            </label>
            <textarea
              name="description"
              rows="3"
              value={formData.description}
              onChange={handleChange}
              placeholder="Summary of contents, scholarly significance, and edition notes..."
              className="w-full px-3 py-2 bg-merino-light border border-sand rounded text-sm text-ink focus:outline-none focus:border-venice-blue"
            />
          </div>
        </div>

        <div className="pt-4 border-t border-sand flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-sand text-ink-muted hover:text-ink text-sm rounded transition"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="px-5 py-2 bg-venice-blue hover:bg-venice-blue-hover text-merino text-sm font-medium rounded transition shadow-sm disabled:opacity-50"
          >
            {submitting ? 'Saving...' : isEditing ? 'Update Title' : 'Acquire to Catalogue'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
