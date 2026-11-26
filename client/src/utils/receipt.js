import { jsPDF } from 'jspdf';

const INSTITUTION = "Book'd Central Library";
const SUBTITLE = 'University Circulation & Archival Ledger';
const BLUE = [36, 62, 99];
const GREEN = [46, 125, 50];

const METHOD_LABELS = {
  CARD: 'Debit / Card',
  UPI: 'Instant UPI',
  BURSARY: 'Student Card'
};

const fmtDate = (d) =>
  d
    ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
    : '-';

const fmtDateTime = (d) =>
  d
    ? new Date(d).toLocaleString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    : '-';

// NOTE: jsPDF's built-in fonts cannot draw the rupee sign, so we print "Rs."
const money = (n) => `Rs. ${Number(n || 0)}`;

const drawHeader = (doc, title) => {
  const w = doc.internal.pageSize.getWidth();
  doc.setFillColor(...BLUE);
  doc.rect(0, 0, w, 32, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.text(INSTITUTION, 14, 15);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text(SUBTITLE, 14, 22);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text(title, w - 14, 15, { align: 'right' });
  doc.setTextColor(30, 30, 30);
};

const drawRows = (doc, rows, startY) => {
  const w = doc.internal.pageSize.getWidth();
  let y = startY;
  rows.forEach(([label, value]) => {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(110, 110, 110);
    doc.text(label, 14, y);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(30, 30, 30);
    const lines = doc.splitTextToSize(String(value ?? '-'), 120);
    doc.text(lines, 70, y);
    y += 6 * lines.length + 2;
    doc.setDrawColor(225, 225, 225);
    doc.line(14, y - 5, w - 14, y - 5);
  });
  return y;
};

const drawStamp = (doc, y, text = 'PAID') => {
  doc.setDrawColor(...GREEN);
  doc.setLineWidth(1.2);
  doc.roundedRect(140, y, 50, 18, 3, 3);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(20);
  doc.setTextColor(...GREEN);
  doc.text(text, 165, y + 12.5, { align: 'center' });
  doc.setTextColor(30, 30, 30);
  doc.setLineWidth(0.2);
};

const drawFooter = (doc, note) => {
  const w = doc.internal.pageSize.getWidth();
  const h = doc.internal.pageSize.getHeight();
  doc.setDrawColor(200, 200, 200);
  doc.line(14, h - 24, w - 14, h - 24);
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(8);
  doc.setTextColor(120, 120, 120);
  doc.text(note, 14, h - 18);
  doc.text(`Generated on ${fmtDateTime(new Date())}`, 14, h - 13);
};

/**
 * Official fine settlement receipt.
 * receipt = { transactionId, paidAmount, paidAt, fine: { id, bookTitle, isbn, dueDate, overdueDays, dailyRate, amount } }
 */
export const generateFineReceipt = ({ receipt, user, method }) => {
  const doc = new jsPDF();
  const fine = receipt.fine || {};
  drawHeader(doc, 'OFFICIAL FINE RECEIPT');

  let y = drawRows(
    doc,
    [
      ['Receipt No.', receipt.transactionId],
      ['Payment Date', fmtDateTime(receipt.paidAt)],
      ['Member', user?.name],
      ['Member ID', user?.memberId],
      ['Department', user?.department],
      ['Fine Reference', fine.id],
      ['Book Title', fine.bookTitle],
      ['ISBN', fine.isbn],
      ['Due Date', fmtDate(fine.dueDate)],
      ['Payment Method', METHOD_LABELS[method] || method]
    ],
    48
  );

  // Fine breakdown table
  y += 4;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('Fine Breakdown', 14, y);
  y += 5;
  doc.setFillColor(240, 240, 240);
  doc.rect(14, y, 182, 8, 'F');
  doc.setFontSize(9);
  doc.text('Description', 17, y + 5.5);
  doc.text('Days', 100, y + 5.5);
  doc.text('Rate / day', 125, y + 5.5);
  doc.text('Amount', 192, y + 5.5, { align: 'right' });
  y += 14;
  doc.setFont('helvetica', 'normal');
  doc.text('Overdue charge', 17, y);
  doc.text(String(fine.overdueDays ?? '-'), 100, y);
  doc.text(money(fine.dailyRate), 125, y);
  doc.text(money(fine.amount), 192, y, { align: 'right' });
  y += 8;
  doc.setDrawColor(150, 150, 150);
  doc.line(14, y, 196, y);
  y += 8;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text('Total Paid', 17, y);
  doc.text(money(receipt.paidAmount ?? fine.amount), 192, y, { align: 'right' });

  drawStamp(doc, y + 12, 'PAID');
  drawFooter(doc, 'This is a computer-generated receipt and does not require a signature.');

  doc.save(`Receipt-${receipt.transactionId}.pdf`);
};