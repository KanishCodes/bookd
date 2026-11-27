import { Router } from 'express';
import { runDailyRemindersCheck } from '../jobs/reminderJob.js';

const router = Router();
const CRON_SECRET = process.env.CRON_SECRET || 'bookd_demo_cron_secret_evaluation';

/**
 * Secret-guarded webhook for external scheduled cron triggers (e.g. Render Cron Job, cron-job.org).
 * Wakes sleeping free-tier host instances and runs due-date scans and email reminders.
 */
router.post('/reminders', async (req, res) => {
  const incomingSecret =
    req.headers['x-cron-secret'] ||
    req.headers.authorization?.replace(/^Bearer\s+/i, '') ||
    req.query.secret;

  if (!incomingSecret || incomingSecret !== CRON_SECRET) {
    return res.status(401).json({
      success: false,
      message: 'Access unauthorized: invalid or missing cron secret header (x-cron-secret)',
    });
  }

  try {
    const stats = await runDailyRemindersCheck();
    res.json({
      success: true,
      message: 'Daily reminder check executed successfully via external cron trigger',
      stats,
    });
  } catch (error) {
    console.error('[Cron Webhook Error]:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to execute reminder job',
    });
  }
});

export default router;
