import { reservationRepository } from '../repositories/reservationRepository.js';
import { bookRepository } from '../repositories/bookRepository.js';
import { userRepository } from '../repositories/userRepository.js';
import { issueRepository } from '../repositories/issueRepository.js';

const isStaff = (user) => ['librarian', 'admin'].includes(user.role);

export const getReservations = async (req, res) => {
  try {
    const userId = isStaff(req.user) ? undefined : req.user.id;
    res.json(await reservationRepository.getAll({ userId }));
  } catch (e) {
    res.status(500).json({ message: e.message || 'Failed to fetch reservations' });
  }
};

export const createReservation = async (req, res) => {
  try {
    const { bookId } = req.body;
    if (!bookId) return res.status(400).json({ message: 'bookId is required' });

    // Members always reserve for themselves; staff may reserve on behalf of a member
    const userId = isStaff(req.user) ? (req.body.userId || req.user.id) : req.user.id;

    const user = await userRepository.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });
    const book = await bookRepository.getById(bookId);
    if (!book) return res.status(404).json({ message: 'Book not found' });

    if (reservationRepository.exists(userId, bookId))
      return res.status(400).json({ message: 'A hold for this title already exists' });
    if (await issueRepository.hasActiveLoan(userId, bookId))
      return res.status(400).json({ message: 'This member already has this book on loan' });

    res.status(201).json(await reservationRepository.create({ book, user }));
  } catch (e) {
    res.status(500).json({ message: e.message || 'Failed to place hold' });
  }
};

export const cancelReservation = async (req, res) => {
  try {
    const reservation = await reservationRepository.getById(req.params.id);
    if (!reservation) return res.status(404).json({ message: 'Reservation not found' });
    if (!isStaff(req.user) && reservation.userId !== req.user.id)
      return res.status(403).json({ message: 'You can only cancel your own holds' });

    reservationRepository.remove(req.params.id);
    res.json({ success: true, message: 'Reservation cancelled' });
  } catch (e) {
    res.status(500).json({ message: e.message || 'Failed to cancel hold' });
  }
};