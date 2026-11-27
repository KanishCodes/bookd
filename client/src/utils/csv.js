const toIsoDate = (value) => (value ? new Date(value).toISOString().slice(0, 10) : '');

export const ISSUE_CSV_COLUMNS = [
  { label: 'Issue Ref', key: 'id' },
  { label: 'Title', key: 'bookTitle' },
  { label: 'Author', key: 'bookAuthor' },
  { label: 'Borrower', key: 'userName' },
  { label: 'Member ID', key: 'memberId' },
  { label: 'Issued On', value: (r) => toIsoDate(r.issuedAt) },
  { label: 'Due Date', value: (r) => toIsoDate(r.dueAt) },
  { label: 'Returned On', value: (r) => toIsoDate(r.returnedAt) },
  { label: 'Status', key: 'status' },
  { label: 'Fine (INR)', key: 'fineAmount' }
];

const escapeCell = (value) => {
  if (value == null) return '';
  let text = String(value);
  // Stop spreadsheet apps from running text that starts like a formula
  if (typeof value === 'string' && /^[=+\-@]/.test(text)) text = `'${text}`;
  if (/[",\r\n]/.test(text)) text = `"${text.replace(/"/g, '""')}"`;
  return text;
};

export const toCsv = (rows, columns) => {
  const header = columns.map((c) => escapeCell(c.label)).join(',');
  const lines = rows.map((row) =>
    columns.map((c) => escapeCell(c.value ? c.value(row) : row[c.key])).join(',')
  );
  return [header, ...lines].join('\r\n');
};

export const downloadCsv = (filename, rows, columns) => {
  // BOM so Excel opens UTF-8 correctly
  const blob = new Blob(['\uFEFF' + toCsv(rows, columns)], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};