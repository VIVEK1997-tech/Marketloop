import { apiClient } from './client';
import { env } from '@/config/env';
import { InvoiceDetail, InvoiceSummary } from '@/types/models';

export const invoiceRepository = {
  getInvoices: async () => {
    const { data } = await apiClient.get<{ invoices: InvoiceSummary[]; items?: InvoiceSummary[] }>('/invoices');
    return data.invoices || data.items || [];
  },
  getInvoice: async (invoiceId: string) => {
    const { data } = await apiClient.get<{ invoice: InvoiceDetail }>(`/invoices/${invoiceId}`);
    return data;
  },
  getPdfUrl: (invoiceId: string) => `${env.apiUrl}/invoices/${invoiceId}/pdf`
};
