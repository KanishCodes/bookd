import cron from 'node-cron';
import mongoose from 'mongoose';
import { issueRepository } from '../repositories/issueRepository.js';
import { IssueRecord } from '../models/IssueRecord.js';
import { sendDueReminderEmail, sendOverdueNoticeEmail } from '../services/emailService.js';
import { getOverdueDays, calculateFine } from '../utils/fines.js';

const DAY_MS = 24 * 60 * 60 * 1000;

/**
 * Scans active library loans and dispatches due reminders or overdue alerts.
 */
export const runDailyRemindersCheck = async () => {
  console.log(`[Cron Job] Starting automated due-date and overdue reminder scan...`);
  const now = new Date();
  let loans = [];

  if (mongoose.connection.readyState === 1) {
    try {
      const docs = await IssueRecord.find({ returnedAt: null });
      loans = docs.map((d) => ({
        id: d.customId || d._id.toString(),
        bookTitle: d.bookTitle,
        userName: d.userName,
        userEmail: d.userEmail,
        dueAt: d.dueAt,
        status: d.status,
      }));
    } catch (err) {
      console.warn('[Cron Job] MongoDB fetch fallback to memory:', err.message);
    }
  }

  if (loans.length === 0) {
    const all = await issueRepository.getAll();
    loans = all.filter((i) => !i.returnedAt);
  }

  let remindersSent = 0;
  let overdueNoticesSent = 0;

  for (const loan of loans) {
    const dueTime = new Date(loan.dueAt).getTime();
    const diffMs = dueTime - now.getTime();

    // 1. Upcoming due in the next 48 hours
    if (diffMs > 0 && diffMs <= 2 * DAY_MS) {
      const daysLeft = Math.max(1, Math.ceil(diffMs / DAY_MS));
      try {
        await sendDueReminderEmail({
          to: loan.userEmail,
          name: loan.userName,
          bookTitle: loan.bookTitle,
          dueDate: loan.dueAt,
          daysLeft,
        });
        remindersSent++;
      } catch (err) {
        console.error(`[Cron Job] Failed to send due reminder to ${loan.userEmail}:`, err.message);
      }
    }
    // 2. Overdue loan
    else if (diffMs < 0) {
      const overdueDays = getOverdueDays(loan.dueAt, null);
      const fineAmount = calculateFine(loan.dueAt, null);
      try {
        await sendOverdueNoticeEmail({
          to: loan.userEmail,
          name: loan.userName,
          bookTitle: loan.bookTitle,
          dueDate: loan.dueAt,
          overdueDays,
          fineAmount,
        });
        overdueNoticesSent++;
      } catch (err) {
        console.error(`[Cron Job] Failed to send overdue alert to ${loan.userEmail}:`, err.message);
      }
    }
  }

  const result = {
    timestamp: new Date().toISOString(),
    scanned: loans.length,
    remindersSent,
    overdueNoticesSent,
  };

  console.log(`[Cron Job] Reminder scan complete:`, result);
  return result;
};

/**
 * Initializes the automated daily scheduler (runs every day at 09:00 AM)
 */
export const initReminderCron = () => {
  if (process.env.ENABLE_CRON === 'false') {
    console.log('[Cron] Automated cron scheduler disabled via ENABLE_CRON=false.');
    return null;
  }

  // Daily at 09:00 AM server time
  const task = cron.schedule('0 9 * * *', async () => {
    try {
      await runDailyRemindersCheck();
    } catch (err) {
      console.error('[Cron Error] Unhandled error during daily reminder task:', err);
    }
  });

  console.log('[Cron] Automated reminder job scheduled (Pattern: "0 9 * * *" - Daily at 09:00 AM).');
  return task;
};

export default {
  runDailyRemindersCheck,
  initReminderCron,
};
