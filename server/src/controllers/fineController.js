import { fineRepository } from '../repositories/fineRepository.js';

const isStaff = (user) => ['librarian', 'admin'].includes(user.role);

export const getFines = async (req, res) => {
  try {
    // Members only ever see their own fines; staff may filter by ?userId=
    const userId = isStaff(req.user) ? req.query.userId : req.user.id;
    res.json(await fineRepository.getAll({ userId }));
  } catch (e) {
    res.status(500).json({ message: e.message || 'Failed to fetch fines' });
  }
};

export const payFine = async (req, res) => {
  try {
    const fine = await fineRepository.getById(req.params.id);
    if (!fine) return res.status(404).json({ message: 'Fine not found or already settled' });
    if (!isStaff(req.user) && fine.userId !== req.user.id)
      return res.status(403).json({ message: 'You can only pay your own fines' });

    const payment = await fineRepository.pay(fine, req.body?.method);
    res.json({
      success: true,
      transactionId: payment.transactionId,
      paidAmount: payment.amount,
      paidAt: payment.paidAt
    });
  } catch (e) {
    res.status(500).json({ message: e.message || 'Payment failed' });
  }
};