import mongoose from 'mongoose';

const bookSchema = new mongoose.Schema(
  {
    customId: {
      type: String,
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Book title is required'],
      trim: true,
      index: true,
    },
    author: {
      type: String,
      required: [true, 'Author name is required'],
      trim: true,
      index: true,
    },
    isbn: {
      type: String,
      required: [true, 'ISBN is required'],
      unique: true,
      trim: true,
      index: true,
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      trim: true,
      index: true,
    },
    coverUrl: {
      type: String,
      default: '',
      trim: true,
    },
    totalCopies: {
      type: Number,
      required: true,
      min: [1, 'Total copies must be at least 1'],
      default: 1,
    },
    availableCopies: {
      type: Number,
      required: true,
      min: [0, 'Available copies cannot be negative'],
      default: 1,
    },
    shelfLocation: {
      type: String,
      default: 'General Stack',
      trim: true,
    },
    publicationYear: {
      type: Number,
    },
    pages: {
      type: Number,
    },
    description: {
      type: String,
      default: '',
      trim: true,
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (doc, ret) => {
        ret.id = ret.customId || ret._id.toString();
        delete ret.__v;
        return ret;
      },
    },
  }
);

// Compound text index for robust full-text search across catalogue
bookSchema.index({ title: 'text', author: 'text', isbn: 'text', category: 'text' });

export const Book = mongoose.model('Book', bookSchema);
export default Book;
