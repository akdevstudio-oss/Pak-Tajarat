type ExportRow = Record<string, unknown>;

function normalizeRows(data: unknown[]): ExportRow[] {
  return (Array.isArray(data) ? data : []).map((row) => {
    if (row && typeof row === 'object') return row as ExportRow;
    return { value: row };
  });
}

function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  anchor.style.display = 'none';
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function csvCell(value: unknown): string {
  const text = value == null
    ? ''
    : typeof value === 'object'
      ? JSON.stringify(value)
      : String(value);
  // Prevent spreadsheet formula injection and quote embedded delimiters.
  const safe = /^[=+@\-\t\r]/.test(text) ? "'" + text : text;
  return '"' + safe.replace(/"/g, '""') + '"';
}

export function exportToCSV(data: unknown[], filename = 'export'): void {
  const rows = normalizeRows(data);
  if (!rows.length) return;
  const keys = Array.from(new Set(rows.flatMap(row => Object.keys(row))));
  const csv = [
    keys.map(csvCell).join(','),
    ...rows.map(row => keys.map(key => csvCell(row[key])).join(','))
  ].join('\r\n');
  downloadBlob(new Blob(['\uFEFF', csv], { type: 'text/csv;charset=utf-8;' }), `${filename}.csv`);
}

/**
 * Exports data to an Excel-compatible HTML workbook without requiring a paid
 * or additional spreadsheet dependency.
 */
export function exportToExcel(data: unknown[], filename = 'export', sheetName = 'Data'): void {
  const rows = normalizeRows(data);
  if (!rows.length) return;
  const keys = Array.from(new Set(rows.flatMap(row => Object.keys(row))));
  const escapeHtml = (value: unknown) => {
    const text = value == null ? '' : typeof value === 'object' ? JSON.stringify(value) : String(value);
    return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  };
  const table = `<table><thead><tr>${keys.map(key => `<th>${escapeHtml(key)}</th>`).join('')}</tr></thead><tbody>${rows.map(row => `<tr>${keys.map(key => `<td>${escapeHtml(row[key])}</td>`).join('')}</tr>`).join('')}</tbody></table>`;
  const html = `<!doctype html><html><head><meta charset="utf-8"><title>${escapeHtml(sheetName)}</title></head><body>${table}</body></html>`;
  downloadBlob(new Blob(['\uFEFF', html], { type: 'application/vnd.ms-excel;charset=utf-8;' }), `${filename}.xls`);
}

/**
 * Opens a print-friendly report so the user can save it as PDF from the browser.
 */
export function exportToPDF(data: unknown[], filename = 'export', title = 'Report'): void {
  const rows = normalizeRows(data);
  if (!rows.length) return;
  const keys = Array.from(new Set(rows.flatMap(row => Object.keys(row))));
  const escapeHtml = (value: unknown) => {
    const text = value == null ? '' : typeof value === 'object' ? JSON.stringify(value) : String(value);
    return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  };
  const html = `<!doctype html><html><head><meta charset="utf-8"><title>${escapeHtml(title)}</title><style>body{font:12px Arial,sans-serif;padding:24px;color:#222}h1{font-size:20px}table{width:100%;border-collapse:collapse}th,td{border:1px solid #ccc;padding:6px;text-align:left;overflow-wrap:anywhere}th{background:#eee} @media print{button{display:none}}</style></head><body><h1>${escapeHtml(title)}</h1><table><thead><tr>${keys.map(key => `<th>${escapeHtml(key)}</th>`).join('')}</tr></thead><tbody>${rows.map(row => `<tr>${keys.map(key => `<td>${escapeHtml(row[key])}</td>`).join('')}</tr>`).join('')}</tbody></table><script>window.onload=()=>window.print()</script></body></html>`;
  const popup = window.open('', '_blank', 'noopener,noreferrer');
  if (!popup) {
    downloadBlob(new Blob([html], { type: 'text/html;charset=utf-8;' }), `${filename}.html`);
    return;
  }
  popup.document.open();
  popup.document.write(html);
  popup.document.close();
}
