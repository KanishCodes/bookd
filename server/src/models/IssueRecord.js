import mongoose from 'mongoose';

const issueRecordSchema = new mongoose.Schema(
  {
    customId: {
      type: String,
      index: true,
    },
    bookId: {
      type: String,
      required: [true, 'Book ID is required'],
      index: true,
    },
    bookTitle: {
      type: String,
      required: true,
      trim: true,
    },
    bookAuthor: {
      type: String,
      required: true,
      trim: true,
    },
    userId: {
      type: String,
      required: [true, 'User ID is required'],
      index: true,
    },
    userName: {
      type: String,
      required: true,
      trim: true,
    },
    userEmail: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    memberId: {
      type: String,
      required: true,
      trim: true,
    },
    issuedAt: {
      type: Date,
      default: Date.now,
    },
    dueAt: {
      type: Date,
      required: [true, 'Due date is required'],
      index: true,
    },
    returnedAt: {
      type: Date,
      default: null,
    },
    renewCount: {
      type: Number,
      default: 0,
      max: [2, 'Maximum of 2 renewals allowed per loan'],
    },
    fineAmount: {
      type: Number,
      default: 0,
      min: 0,
    },
    status: {
      type: String,
      enum: ['ACTIVE', 'OVERDUE', 'RETURNED'],
      default: 'ACTIVE',
      index: true,
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

// Compound indexes for high-speed queries on member loans and circulation desk
issueRecordSchema.index({ userId: 1, status: 1 });
issueRecordSchema.index({ bookId: 1, status: 1 });
issueRecordSchema.index({ dueAt: 1, status: 1 });

export const IssueRecord = mongoose.model('IssueRecord', issueRecordSchema);
export default IssueRecord;
