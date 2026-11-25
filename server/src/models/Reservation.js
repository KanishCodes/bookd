import mongoose from 'mongoose';

const reservationSchema = new mongoose.Schema(
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
    memberId: {
      type: String,
      required: true,
      trim: true,
    },
    queuePosition: {
      type: Number,
      required: true,
      default: 1,
      min: 1,
    },
    status: {
      type: String,
      enum: ['WAITING', 'READY_FOR_PICKUP', 'FULFILLED', 'CANCELLED'],
      default: 'WAITING',
      index: true,
    },
    reservedAt: {
      type: Date,
      default: Date.now,
    },
    estimatedDate: {
      type: String,
      default: '',
    },
    notifiedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (doc, ret) => {
        ret.id = ret.customId || ret._id.toString();
        // Provide alias position to match PDF brief
        ret.position = ret.queuePosition;
        delete ret.__v;
        return ret;
      },
    },
  }
);

// Compound indexes for queue tracking and patron reservations
reservationSchema.index({ bookId: 1, queuePosition: 1 });
reservationSchema.index({ userId: 1, status: 1 });

export const Reservation = mongoose.model('Reservation', reservationSchema);
export default Reservation;
