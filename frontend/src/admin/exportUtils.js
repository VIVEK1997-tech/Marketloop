const safeName = (value) => String(value || 'document').replace(/[^a-z0-9-_]+/gi, '-').replace(/-+/g, '-').toLowerCase();

const downloadBlob = (blob, filename) => {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
};

export const downloadCsv = (filename, rows) => {
  if (!rows?.length) return;
  const headers = Object.keys(rows[0]);
  const csv = [
    headers.join(','),
    ...rows.map((row) => headers.map((header) => `"${String(row[header] ?? '').replace(/"/g, '""')}"`).join(','))
  ].join('\n');
  downloadBlob(new Blob([csv], { type: 'text/csv;charset=utf-8' }), `${safeName(filename)}.csv`);
};

const crcTable = new Uint32Array(256).map((_, index) => {
  let c = index;
  for (let k = 0; k < 8; k += 1) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  return c >>> 0;
});

const crc32 = (input) => {
  let crc = 0xffffffff;
  for (let i = 0; i < input.length; i += 1) {
    crc = crcTable[(crc ^ input[i]) & 0xff] ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
};

const concatUint8Arrays = (parts) => {
  const totalLength = parts.reduce((sum, part) => sum + part.length, 0);
  const result = new Uint8Array(totalLength);
  let offset = 0;
  parts.forEach((part) => {
    result.set(part, offset);
    offset += part.length;
  });
  return result;
};

export const downloadZip = (filename, files) => {
  if (!files?.length) return;
  const encoder = new TextEncoder();
  const localParts = [];
  const centralParts = [];
  let offset = 0;

  files.forEach((file) => {
    const name = `${safeName(file.name)}.${file.extension || 'txt'}`;
    const nameBytes = encoder.encode(name);
    const dataBytes = encoder.encode(file.content);
    const crc = crc32(dataBytes);

    const localHeader = new Uint8Array(30);
    const localView = new DataView(localHeader.buffer);
    localView.setUint32(0, 0x04034b50, true);
    localView.setUint16(4, 20, true);
    localView.setUint16(8, 0, true);
    localView.setUint16(10, 0, true);
    localView.setUint32(14, crc, true);
    localView.setUint32(18, dataBytes.length, true);
    localView.setUint32(22, dataBytes.length, true);
    localView.setUint16(26, nameBytes.length, true);

    localParts.push(localHeader, nameBytes, dataBytes);

    const centralHeader = new Uint8Array(46);
    const centralView = new DataView(centralHeader.buffer);
    centralView.setUint32(0, 0x02014b50, true);
    centralView.setUint16(4, 20, true);
    centralView.setUint16(6, 20, true);
    centralView.setUint32(16, crc, true);
    centralView.setUint32(20, dataBytes.length, true);
    centralView.setUint32(24, dataBytes.length, true);
    centralView.setUint16(28, nameBytes.length, true);
    centralView.setUint32(42, offset, true);

    centralParts.push(centralHeader, nameBytes);
    offset += localHeader.length + nameBytes.length + dataBytes.length;
  });

  const centralDirectory = concatUint8Arrays(centralParts);
  const localDirectory = concatUint8Arrays(localParts);
  const endRecord = new Uint8Array(22);
  const endView = new DataView(endRecord.buffer);
  endView.setUint32(0, 0x06054b50, true);
  endView.setUint16(8, files.length, true);
  endView.setUint16(10, files.length, true);
  endView.setUint32(12, centralDirectory.length, true);
  endView.setUint32(16, localDirectory.length, true);

  const archive = concatUint8Arrays([localDirectory, centralDirectory, endRecord]);
  downloadBlob(new Blob([archive], { type: 'application/zip' }), `${safeName(filename)}.zip`);
};

export const printInvoicePreview = ({ title, rows, summary }) => {
  const popup = window.open('', '_blank', 'width=960,height=720');
  if (!popup) return;
  const tableRows = rows
    .map((row) => `<tr>${Object.values(row).map((value) => `<td style="padding:8px;border:1px solid #e2e8f0;">${value}</td>`).join('')}</tr>`)
    .join('');
  popup.document.write(`
    <html>
      <head>
        <title>${title}</title>
        <style>
          body{font-family:Arial,sans-serif;padding:24px;color:#0f172a}
          h1{margin:0 0 12px}
          table{border-collapse:collapse;width:100%;margin-top:16px}
          th{padding:8px;border:1px solid #e2e8f0;background:#f8fafc;text-align:left}
          td{padding:8px;border:1px solid #e2e8f0}
          .summary{margin-top:16px;padding:16px;background:#f8fafc;border-radius:12px}
        </style>
      </head>
      <body>
        <h1>${title}</h1>
        <table>
          <thead>
            <tr>${Object.keys(rows[0] || {}).map((key) => `<th>${key}</th>`).join('')}</tr>
          </thead>
          <tbody>${tableRows}</tbody>
        </table>
        <div class="summary">${summary}</div>
      </body>
    </html>
  `);
  popup.document.close();
  popup.focus();
  popup.print();
};
