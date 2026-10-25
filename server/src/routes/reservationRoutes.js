import { Router } from 'express';
import { getReservations, createReservation, cancelReservation } from '../controllers/reservationController.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();
router.get('/', authenticate, getReservations);
router.post('/', authenticate, createReservation);
router.delete('/:id', authenticate, cancelReservation);
export default router;