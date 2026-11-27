import { userRepository, toPublicUser } from '../repositories/userRepository.js';

export const getUsers = async (req, res) => {
  try {
    const { role, search } = req.query;
    let users = await userRepository.getAll();

    if (role && role.trim() !== '') {
      const targetRole = role.toLowerCase().trim();
      users = users.filter((u) => (u.role || '').toLowerCase() === targetRole);
    }

    if (search && search.trim() !== '') {
      const q = search.toLowerCase().trim();
      users = users.filter(
        (u) =>
          (u.name || '').toLowerCase().includes(q) ||
          (u.email || '').toLowerCase().includes(q) ||
          (u.memberId || '').toLowerCase().includes(q)
      );
    }

    const publicUsers = users.map((u) => toPublicUser(u));
    res.json(publicUsers);
  } catch (error) {
    res.status(500).json({ message: error.message || 'Failed to fetch users' });
  }
};
