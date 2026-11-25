import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import { User } from '../models/User.js';
import { Book } from '../models/Book.js';
import { IssueRecord } from '../models/IssueRecord.js';
import { Reservation } from '../models/Reservation.js';
import {
  INITIAL_BOOKS,
  INITIAL_USERS,
  INITIAL_ISSUES,
  INITIAL_RESERVATIONS,
} from '../data/seedData.js';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/bookd';
const DEMO_PASSWORD = 'demo1234';

export const seedDatabase = async () => {
  if (process.env.NODE_ENV === 'production' && process.env.ALLOW_SEED !== 'true') {
    console.error('[Seeder Blocked] Seeding in production requires ALLOW_SEED=true environment variable.');
    process.exit(1);
  }

  console.log(`[Seeder] Connecting to MongoDB: ${MONGO_URI}`);
  await mongoose.connect(MONGO_URI, { serverSelectionTimeoutMS: 8000 });
  console.log('[Seeder] Connected successfully.');

  try {
    console.log('[Seeder] Purging existing collections...');
    await Promise.all([
      User.deleteMany({}),
      Book.deleteMany({}),
      IssueRecord.deleteMany({}),
      Reservation.deleteMany({}),
    ]);

    // 1. Seed Users with hashed demo passwords
    const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 10);
    const usersToInsert = INITIAL_USERS.map((user) => ({
      customId: user.id,
      name: user.name,
      email: user.email.toLowerCase(),
      passwordHash,
      role: user.role,
      memberId: user.memberId,
      department: user.department || 'General Studies',
      phone: user.phone || '',
      isActive: true,
    }));
    const seededUsers = await User.insertMany(usersToInsert);
    console.log(`[Seeder] Users seeded: ${seededUsers.length}`);

    // 2. Seed Books
    const booksToInsert = INITIAL_BOOKS.map((book) => ({
      customId: book.id,
      title: book.title,
      author: book.author,
      isbn: book.isbn,
      category: book.category,
      coverUrl: book.coverUrl || '',
      totalCopies: book.totalCopies,
      availableCopies: book.availableCopies,
      shelfLocation: book.shelfLocation || 'General Stack',
      publicationYear: book.publicationYear,
      pages: book.pages,
      description: book.description || '',
    }));
    const seededBooks = await Book.insertMany(booksToInsert);
    console.log(`[Seeder] Books seeded: ${seededBooks.length}`);

    // 3. Seed Issue Records
    const issuesToInsert = INITIAL_ISSUES.map((issue) => ({
      customId: issue.id,
      bookId: issue.bookId,
      bookTitle: issue.bookTitle,
      bookAuthor: issue.bookAuthor,
      userId: issue.userId,
      userName: issue.userName,
      userEmail: issue.userEmail.toLowerCase(),
      memberId: issue.memberId,
      issuedAt: new Date(issue.issuedAt),
      dueAt: new Date(issue.dueAt),
      returnedAt: issue.returnedAt ? new Date(issue.returnedAt) : null,
      renewCount: issue.renewCount || 0,
      fineAmount: issue.fineAmount || 0,
      status: issue.status,
    }));
    const seededIssues = await IssueRecord.insertMany(issuesToInsert);
    console.log(`[Seeder] Issue records seeded: ${seededIssues.length}`);

    // 4. Seed Reservations
    const reservationsToInsert = INITIAL_RESERVATIONS.map((res) => ({
      customId: res.id,
      bookId: res.bookId,
      bookTitle: res.bookTitle,
      bookAuthor: res.bookAuthor,
      userId: res.userId,
      userName: res.userName,
      memberId: res.memberId,
      queuePosition: res.queuePosition || 1,
      status: res.status || 'WAITING',
      reservedAt: new Date(res.reservedAt),
      estimatedDate: res.estimatedDate || '',
      notifiedAt: null,
    }));
    const seededReservations = await Reservation.insertMany(reservationsToInsert);
    console.log(`[Seeder] Reservations seeded: ${seededReservations.length}`);

    console.log('\n======================================================');
    console.log(' Database seeded successfully with evaluation data!');
    console.log(' Demo Accounts (Password: demo1234):');
    console.log('   - Member:    member@bookd.test');
    console.log('   - Librarian: librarian@bookd.test');
    console.log('   - Admin:     admin@bookd.test');
    console.log('======================================================\n');
  } catch (error) {
    console.error('[Seeder Error] Failed to seed database:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('[Seeder] Disconnected cleanly.');
  }
};

// Direct script execution
if (process.argv[1]?.endsWith('seeder.js')) {
  seedDatabase()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}
