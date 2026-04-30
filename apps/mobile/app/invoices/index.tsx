import { useQuery } from '@tanstack/react-query';
import { router } from 'expo-router';
import { Pressable, Text, View } from 'react-native';
import { StatusPill } from '@/components/payments/StatusPill';
import { SectionHeader } from '@/components/marketplace/SectionHeader';
import { Card } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { Screen } from '@/components/ui/Screen';
import { StatCard } from '@/components/ui/StatCard';
import { invoiceRepository } from '@/services/api/invoice.repository';

const getInvoiceTone = (status?: string) => {
  const normalized = String(status || '').toLowerCase();
  if (normalized === 'paid') return 'success' as const;
  if (['pending', 'partial', 'partially paid'].includes(normalized)) return 'warning' as const;
  if (['overdue', 'cancelled'].includes(normalized)) return 'danger' as const;
  return 'neutral' as const;
};

export default function InvoicesScreen() {
  const { data: invoices = [] } = useQuery({
    queryKey: ['invoices'],
    queryFn: invoiceRepository.getInvoices
  });

  const paidInvoices = invoices.filter((invoice) => String(invoice.status).toLowerCase() === 'paid');
  const pendingInvoices = invoices.filter((invoice) => String(invoice.status).toLowerCase() !== 'paid');
  const totalInvoiced = invoices.reduce((sum, invoice) => sum + Number(invoice.total || 0), 0);

  return (
    <Screen>
      <View className="gap-5">
        <SectionHeader title="Invoices" subtitle="Review invoice status, tax summary, and PDF access from your mobile workspace." />

        <View className="flex-row flex-wrap gap-3">
          <View className="min-w-[48%] flex-1">
            <StatCard label="Total invoices" value={String(invoices.length)} />
          </View>
          <View className="min-w-[48%] flex-1">
            <StatCard label="Paid" value={String(paidInvoices.length)} />
          </View>
          <View className="min-w-[48%] flex-1">
            <StatCard label="Pending" value={String(pendingInvoices.length)} />
          </View>
          <View className="min-w-[48%] flex-1">
            <StatCard label="Total value" value={`Rs. ${totalInvoiced.toLocaleString('en-IN')}`} />
          </View>
        </View>

        {!invoices.length ? (
          <EmptyState title="No invoices available" description="Customer and seller invoices will appear here after orders and payment flows complete." />
        ) : (
          invoices.map((invoice) => (
            <Pressable key={invoice.invoiceNumber} onPress={() => router.push(`/invoices/${invoice.invoiceNumber}`)}>
              <Card>
                <View className="gap-3">
                  <View className="flex-row items-start justify-between gap-3">
                    <View className="flex-1">
                      <Text className="text-lg font-bold text-slate-900">{invoice.invoiceNumber}</Text>
                      <Text className="mt-1 text-sm text-slate-500">{invoice.partyName} - {invoice.invoiceType}</Text>
                    </View>
                    <StatusPill label={invoice.status} tone={getInvoiceTone(invoice.status)} />
                  </View>
                  <Text className="text-base font-semibold text-brand-700">{invoice.formattedTotal || `Rs. ${Number(invoice.total || 0).toLocaleString('en-IN')}`}</Text>
                  <Text className="text-sm text-slate-500">
                    Issued {invoice.issueDate ? new Date(invoice.issueDate).toLocaleDateString() : 'N/A'}
                    {invoice.dueDate ? ` | Due ${new Date(invoice.dueDate).toLocaleDateString()}` : ''}
                  </Text>
                </View>
              </Card>
            </Pressable>
          ))
        )}
      </View>
    </Screen>
  );
}
