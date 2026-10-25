import { Router } from 'express';
import { getFines, payFine } from '../controllers/fineController.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();
router.get('/', authenticate, getFines);
router.post('/:id/pay', authenticate, payFine);
export default router;