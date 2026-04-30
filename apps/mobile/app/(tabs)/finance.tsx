import { useQuery } from '@tanstack/react-query';
import { router } from 'expo-router';
import { Pressable, Text, View } from 'react-native';
import { SectionHeader } from '@/components/marketplace/SectionHeader';
import { StatusPill } from '@/components/payments/StatusPill';
import { Card } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { Screen } from '@/components/ui/Screen';
import { StatCard } from '@/components/ui/StatCard';
import { invoiceRepository } from '@/services/api/invoice.repository';
import { useAuthStore } from '@/store/auth-store';

export default function FinanceScreen() {
  const role = useAuthStore((state) => state.user?.activeRole || state.user?.role);
  const { data: invoices = [] } = useQuery({
    queryKey: ['invoices-summary'],
    queryFn: invoiceRepository.getInvoices
  });

  return (
    <Screen>
      <View className="gap-5">
        <SectionHeader
          title={role === 'seller' ? 'Seller finance' : 'Invoices'}
          subtitle={role === 'seller' ? 'Follow pending and paid invoice activity from your seller workspace.' : 'Review invoice activity from mobile.'}
        />

        <View className="flex-row flex-wrap gap-3">
          <View className="min-w-[48%] flex-1">
            <StatCard label="Invoices" value={String(invoices.length)} />
          </View>
          <View className="min-w-[48%] flex-1">
            <StatCard label="Pending" value={String(invoices.filter((invoice) => String(invoice.status).toLowerCase() !== 'paid').length)} />
          </View>
          <View className="min-w-[48%] flex-1">
            <StatCard label="Paid" value={String(invoices.filter((invoice) => String(invoice.status).toLowerCase() === 'paid').length)} />
          </View>
          <View className="min-w-[48%] flex-1">
            <StatCard label="Total value" value={`Rs. ${invoices.reduce((sum, invoice) => sum + Number(invoice.total || 0), 0).toLocaleString('en-IN')}`} />
          </View>
        </View>

        {!invoices.length ? <EmptyState title="No finance records yet" description="Invoices will appear here after sales and payment flows complete." /> : null}

        {invoices.slice(0, 15).map((invoice) => (
          <Pressable key={invoice.invoiceNumber} onPress={() => router.push(`/invoices/${invoice.invoiceNumber}`)}>
            <Card>
              <View className="gap-3">
                <View className="flex-row items-start justify-between gap-3">
                  <View className="flex-1">
                    <Text className="text-lg font-bold text-slate-900">{invoice.invoiceNumber}</Text>
                    <Text className="mt-1 text-sm text-slate-500">{invoice.partyName} - {invoice.invoiceType}</Text>
                  </View>
                  <StatusPill
                    label={invoice.status}
                    tone={String(invoice.status).toLowerCase() === 'paid' ? 'success' : String(invoice.status).toLowerCase() === 'pending' ? 'warning' : 'neutral'}
                  />
                </View>
                <Text className="text-base font-semibold text-brand-700">Rs. {Number(invoice.total || 0).toLocaleString('en-IN')}</Text>
                <Text className="text-sm text-slate-500">Issued {invoice.issueDate ? new Date(invoice.issueDate).toLocaleDateString() : 'N/A'}</Text>
              </View>
            </Card>
          </Pressable>
        ))}
      </View>
    </Screen>
  );
}
