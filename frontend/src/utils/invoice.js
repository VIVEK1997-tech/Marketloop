export const formatInvoiceCurrency = (value) => `Rs. ${Number(value || 0).toLocaleString('en-IN')}`;

export const formatInvoiceDate = (value) => {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '-';
  return date.toLocaleString('en-IN');
};

export const downloadInvoicePdf = async (api, invoiceIdOrNumber) => {
  const response = await api.get(`/invoices/${invoiceIdOrNumber}/pdf`, { responseType: 'blob' });
  const blob = new Blob([response.data], { type: 'application/pdf' });
  const disposition = response.headers['content-disposition'] || '';
  const fileNameMatch = disposition.match(/filename="([^"]+)"/i);
  const fileName = fileNameMatch?.[1] || `invoice-${invoiceIdOrNumber}.pdf`;
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  link.click();
  URL.revokeObjectURL(url);
};
