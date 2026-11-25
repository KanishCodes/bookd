import { userRepository, toPublicUser } from '../repositories/userRepository.js';

export const getUsers = async (req, res) => {
  try {
    const users = await userRepository.getAll();
    const publicUsers = users.map((u) => toPublicUser(u));
    res.json(publicUsers);
  } catch (error) {
    res.status(500).json({ message: error.message || 'Failed to fetch users' });
  }
};
