import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { INITIAL_USERS } from '../data/seedData.js';
import { User } from '../models/User.js';

const DEMO_HASH = bcrypt.hashSync('demo1234', 10);

export const toPublicUser = (user) => {
  if (!user) return null;
  const obj = typeof user.toObject === 'function' ? user.toObject({ virtuals: true }) : { ...user };
  delete obj.passwordHash;
  delete obj.__v;
  obj.id = obj.customId || obj.id || obj._id?.toString();
  return obj;
};

const EMAIL_ALIASES = {
  kanish: 'member@bookd.test',
  'kanish@bookd.test': 'member@bookd.test',
  naisha: 'librarian@bookd.test',
  'naisha@bookd.test': 'librarian@bookd.test',
  patel: 'admin@bookd.test',
  'patel@bookd.test': 'admin@bookd.test',
};

class UserRepository {
  constructor() {
    this.users = INITIAL_USERS.map((u) => ({ ...u, passwordHash: DEMO_HASH }));
  }

  async findByEmail(email) {
    const clean = email.trim().toLowerCase();
    const target = EMAIL_ALIASES[clean] || clean;

    if (mongoose.connection.readyState === 1) {
      try {
        const doc = await User.findOne({ email: target });
        if (doc) return doc;
      } catch (err) {
        console.warn('[UserRepo] MongoDB findByEmail warning:', err.message);
      }
    }
    return this.users.find((u) => u.email.toLowerCase() === target) || null;
  }

  async getAll() {
    let result = [];
    if (mongoose.connection.readyState === 1) {
      try {
        const docs = await User.find({});
        if (docs && docs.length > 0) {
          result = docs.map((d) => toPublicUser(d));
        }
      } catch (err) {
        console.warn('[UserRepo] MongoDB getAll warning:', err.message);
      }
    }

    const existingIds = new Set(result.map((u) => u.id || u.customId));
    for (const u of this.users) {
      if (!existingIds.has(u.id)) {
        result.push(toPublicUser(u));
      }
    }
    return result;
  }

  async findById(id) {
    if (mongoose.connection.readyState === 1) {
      try {
        const query = {
          $or: [
            { customId: id },
            ...(mongoose.isValidObjectId(id) ? [{ _id: id }] : []),
          ],
        };
        const doc = await User.findOne(query);
        if (doc) return doc;
      } catch (err) {
        console.warn('[UserRepo] MongoDB findById warning:', err.message);
      }
    }
    return this.users.find((u) => u.id === id || u.customId === id) || null;
  }

  async create({ name, email, passwordHash, department }) {
    const cleanEmail = email.trim().toLowerCase();
    const memberId = `MEM-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`;
    const customId = `u-${Date.now()}`;

    const userMem = {
      id: customId,
      customId,
      name: name.trim(),
      email: cleanEmail,
      role: 'member', // anti-escalation
      memberId,
      department: (department || 'General Studies').trim(),
      passwordHash,
      isActive: true,
    };
    this.users.push(userMem);

    if (mongoose.connection.readyState === 1) {
      try {
        const doc = await User.create({
          customId,
          name: name.trim(),
          email: cleanEmail,
          passwordHash,
          role: 'member', // anti-escalation
          memberId,
          department: (department || 'General Studies').trim(),
          isActive: true,
        });
        return doc;
      } catch (err) {
        console.warn('[UserRepo] MongoDB create warning:', err.message);
      }
    }

    return userMem;
  }
}

export const userRepository = new UserRepository();
