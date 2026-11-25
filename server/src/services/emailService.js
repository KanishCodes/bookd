import nodemailer from 'nodemailer';

const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';

/**
 * Creates an active SMTP transporter or an evaluation logger when SMTP credentials are unset.
 */
const getTransporter = () => {
  if (process.env.SMTP_HOST && process.env.SMTP_USER) {
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 587,
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  // Graceful development/evaluation fallback
  return {
    sendMail: async (mailOptions) => {
      console.log(`\n======================================================`);
      console.log(`[Email Sent Simulated]`);
      console.log(`To:      ${mailOptions.to}`);
      console.log(`Subject: ${mailOptions.subject}`);
      console.log(`Preview: ${mailOptions.text?.slice(0, 140) || 'HTML Email Body'}`);
      console.log(`======================================================\n`);
      return { messageId: `sim-${Date.now()}` };
    },
  };
};

const transporter = getTransporter();

/**
 * Sends a due date reminder email (e.g. 1-2 days before dueAt)
 */
export const sendDueReminderEmail = async ({ to, name, bookTitle, dueDate, daysLeft }) => {
  const formattedDate = new Date(dueDate).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  const mailOptions = {
    from: `"Book'd Archival Library" <${process.env.SMTP_FROM || 'circulation@bookd.test'}>`,
    to,
    subject: `Due Reminder: "${bookTitle}" is due in ${daysLeft} day${daysLeft > 1 ? 's' : ''}`,
    text: `Hello ${name}, your library loan of "${bookTitle}" is due on ${formattedDate}. You can renew for +14 days on your member dashboard.`,
    html: `
      <div style="font-family: 'Figtree', Arial, sans-serif; max-width: 580px; margin: 0 auto; background-color: #FDFBF7; border: 1px solid #E2D9C8; border-radius: 8px; overflow: hidden;">
        <div style="background-color: #16587B; padding: 24px 32px; color: #FFFFFF;">
          <h1 style="font-family: 'Fraunces', Georgia, serif; margin: 0; font-size: 24px; font-weight: normal; letter-spacing: -0.5px;">Book’d Archival Library</h1>
          <p style="margin: 4px 0 0; font-size: 13px; color: #A6D2E6; text-transform: uppercase; letter-spacing: 1px;">Circulation Desk Notice</p>
        </div>
        <div style="padding: 32px;">
          <p style="font-size: 15px; color: #2D3748; margin-top: 0;">Dear <strong>${name}</strong>,</p>
          <p style="font-size: 14px; color: #4A5568; line-height: 1.6;">
            This is a friendly reminder that your borrowed title is due in <strong>${daysLeft} day${daysLeft > 1 ? 's' : ''}</strong>:
          </p>
          <div style="background-color: #F5EEDD; border-left: 4px solid #16587B; padding: 16px 20px; margin: 20px 0; border-radius: 4px;">
            <p style="font-size: 16px; font-weight: bold; color: #16587B; margin: 0 0 4px 0;">${bookTitle}</p>
            <p style="font-size: 13px; color: #718096; margin: 0;">Due Date: <strong>${formattedDate}</strong></p>
          </div>
          <p style="font-size: 13px; color: #718096; line-height: 1.5;">
            Need more time? You can extend your loan by <strong>+14 days</strong> (up to 2 renewals allowed) from your dashboard before the due date.
          </p>
          <div style="margin: 28px 0;">
            <a href="${CLIENT_URL}/dashboard" style="background-color: #16587B; color: #FFFFFF; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-size: 14px; font-weight: 600; display: inline-block;">
              Open Member Dashboard
            </a>
          </div>
          <hr style="border: none; border-top: 1px solid #E2D9C8; margin: 24px 0;" />
          <p style="font-size: 11px; color: #A0AEC0; margin: 0;">
            Book'd Institutional Library System &bull; Overdue rate: ₹5/day after due date.
          </p>
        </div>
      </div>
    `,
  };

  return transporter.sendMail(mailOptions);
};

/**
 * Sends an overdue fine alert email
 */
export const sendOverdueNoticeEmail = async ({ to, name, bookTitle, dueDate, overdueDays, fineAmount }) => {
  const mailOptions = {
    from: `"Book'd Archival Library" <${process.env.SMTP_FROM || 'circulation@bookd.test'}>`,
    to,
    subject: `OVERDUE NOTICE: "${bookTitle}" - ₹${fineAmount} fine accrued`,
    text: `Hello ${name}, your book "${bookTitle}" is overdue by ${overdueDays} days. Total fine accrued: ₹${fineAmount}. Please return it to the circulation desk immediately.`,
    html: `
      <div style="font-family: 'Figtree', Arial, sans-serif; max-width: 580px; margin: 0 auto; background-color: #FDFBF7; border: 1px solid #E2D9C8; border-radius: 8px; overflow: hidden;">
        <div style="background-color: #C84B31; padding: 24px 32px; color: #FFFFFF;">
          <h1 style="font-family: 'Fraunces', Georgia, serif; margin: 0; font-size: 24px; font-weight: normal;">Overdue Loan Alert</h1>
          <p style="margin: 4px 0 0; font-size: 13px; color: #FED7D7; text-transform: uppercase; letter-spacing: 1px;">Immediate Action Required</p>
        </div>
        <div style="padding: 32px;">
          <p style="font-size: 15px; color: #2D3748; margin-top: 0;">Dear <strong>${name}</strong>,</p>
          <p style="font-size: 14px; color: #4A5568; line-height: 1.6;">
            The circulation system has detected an overdue loan on your account:
          </p>
          <div style="background-color: #FFF5F5; border-left: 4px solid #C84B31; padding: 16px 20px; margin: 20px 0; border-radius: 4px;">
            <p style="font-size: 16px; font-weight: bold; color: #9B2C2C; margin: 0 0 6px 0;">${bookTitle}</p>
            <p style="font-size: 13px; color: #742A2A; margin: 0 0 4px 0;">Overdue Duration: <strong>${overdueDays} day(s)</strong></p>
            <p style="font-size: 13px; color: #742A2A; margin: 0;">Fine Incurred: <strong style="font-size: 15px; color: #C84B31;">₹${fineAmount}</strong> (at ₹5/day)</p>
          </div>
          <p style="font-size: 13px; color: #718096; line-height: 1.5;">
            Please return this title to the library desk or settle accrued dues to restore full borrowing privileges.
          </p>
          <div style="margin: 28px 0;">
            <a href="${CLIENT_URL}/fines" style="background-color: #C84B31; color: #FFFFFF; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-size: 14px; font-weight: 600; display: inline-block;">
              View Fine Ledger
            </a>
          </div>
        </div>
      </div>
    `,
  };

  return transporter.sendMail(mailOptions);
};

/**
 * Sends a ready-for-pickup notification when a reserved book is checked back in
 */
export const sendReservationPickupEmail = async ({ to, name, bookTitle, shelfLocation }) => {
  const mailOptions = {
    from: `"Book'd Archival Library" <${process.env.SMTP_FROM || 'circulation@bookd.test'}>`,
    to,
    subject: `Hold Ready for Pickup: "${bookTitle}"`,
    text: `Hello ${name}, your reserved book "${bookTitle}" is now ready for pickup at shelf ${shelfLocation || 'Circulation Desk'}.`,
    html: `
      <div style="font-family: 'Figtree', Arial, sans-serif; max-width: 580px; margin: 0 auto; background-color: #FDFBF7; border: 1px solid #E2D9C8; border-radius: 8px; overflow: hidden;">
        <div style="background-color: #3E7B54; padding: 24px 32px; color: #FFFFFF;">
          <h1 style="font-family: 'Fraunces', Georgia, serif; margin: 0; font-size: 24px; font-weight: normal;">Your Reservation is Ready</h1>
          <p style="margin: 4px 0 0; font-size: 13px; color: #C6F6D5; text-transform: uppercase; letter-spacing: 1px;">Ready at Circulation Desk</p>
        </div>
        <div style="padding: 32px;">
          <p style="font-size: 15px; color: #2D3748; margin-top: 0;">Dear <strong>${name}</strong>,</p>
          <p style="font-size: 14px; color: #4A5568; line-height: 1.6;">
            A copy of your reserved book has been returned and is waiting for you at the library desk:
          </p>
          <div style="background-color: #F0FFF4; border-left: 4px solid #3E7B54; padding: 16px 20px; margin: 20px 0; border-radius: 4px;">
            <p style="font-size: 16px; font-weight: bold; color: #22543D; margin: 0 0 4px 0;">${bookTitle}</p>
            <p style="font-size: 13px; color: #276749; margin: 0;">Hold Shelf: <strong>${shelfLocation || 'Main Circulation Counter'}</strong></p>
          </div>
          <p style="font-size: 13px; color: #718096; line-height: 1.5;">
            Please collect your title within <strong>48 hours</strong>, after which it will be offered to the next patron in queue.
          </p>
        </div>
      </div>
    `,
  };

  return transporter.sendMail(mailOptions);
};

export default {
  sendDueReminderEmail,
  sendOverdueNoticeEmail,
  sendReservationPickupEmail,
};
