import bcrypt from 'bcryptjs';
import { INITIAL_USERS } from '../data/seedData.js';

const DEMO_HASH = bcrypt.hashSync('demo1234', 10);

export const toPublicUser = ({ passwordHash, ...rest }) => rest;

class UserRepository {
  constructor() {
    this.users = INITIAL_USERS.map(u => ({ ...u, passwordHash: DEMO_HASH }));
  }
  async findByEmail(email) {
    return this.users.find(u => u.email.toLowerCase() === email.trim().toLowerCase()) || null;
  }
  async findById(id) {
    return this.users.find(u => u.id === id) || null;
  }
  async create({ name, email, passwordHash, department }) {
    const user = {
      id: `u-${Date.now()}`,
      name: name.trim(),
      email: email.trim().toLowerCase(),
      role: 'member', // never trust a role from the request body
      memberId: `MEM-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`,
      department: (department || 'General Studies').trim(),
      passwordHash,
    };
    this.users.push(user);
    return user;
  }
}

export const userRepository = new UserRepository();