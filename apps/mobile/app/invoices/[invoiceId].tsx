import * as Linking from 'expo-linking';
import * as Sharing from 'expo-sharing';
import { File, Paths } from 'expo-file-system';
import { useQuery } from '@tanstack/react-query';
import { useLocalSearchParams } from 'expo-router';
import { Alert, Text, View } from 'react-native';
import { StatusPill } from '@/components/payments/StatusPill';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Screen } from '@/components/ui/Screen';
import { invoiceRepository } from '@/services/api/invoice.repository';

const formatMoney = (value?: number) => `Rs. ${Number(value || 0).toLocaleString('en-IN')}`;

export default function InvoiceDetailScreen() {
  const { invoiceId } = useLocalSearchParams<{ invoiceId: string }>();
  const { data } = useQuery({
    queryKey: ['invoice', invoiceId],
    queryFn: () => invoiceRepository.getInvoice(String(invoiceId)),
    enabled: !!invoiceId
  });

  const invoice = data?.invoice;

  const sharePdf = async () => {
    const pdfUrl = invoiceRepository.getPdfUrl(String(invoiceId));
    const target = new File(Paths.cache, `${invoiceId}.pdf`);
    try {
      const downloadedFile = await File.downloadFileAsync(pdfUrl, target);
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(downloadedFile.uri);
      } else {
        await Linking.openURL(pdfUrl);
      }
    } catch {
      Alert.alert('Unable to open PDF', 'Please try again after verifying the backend is running.');
    }
  };

  return (
    <Screen>
      <View className="gap-4">
        <Card>
          <Text className="text-xs font-semibold uppercase tracking-[2px] text-slate-400">Invoice workspace</Text>
          <Text className="mt-2 text-2xl font-black text-slate-900">{invoice?.invoiceNumber || String(invoiceId)}</Text>
          <Text className="mt-2 text-sm text-slate-500">{invoice?.partyName || invoice?.buyer?.name || invoice?.seller?.name || 'Invoice details'}</Text>
          <View className="mt-3">
            <StatusPill label={invoice?.status || 'Pending'} tone={String(invoice?.status || '').toLowerCase() === 'paid' ? 'success' : 'warning'} />
          </View>
        </Card>

        <Card>
          <Text className="text-lg font-bold text-slate-900">Tax breakdown</Text>
          <Text className="mt-3 text-sm text-slate-500">CGST: {formatMoney(invoice?.taxSummary?.cgstAmount)}</Text>
          <Text className="mt-1 text-sm text-slate-500">SGST: {formatMoney(invoice?.taxSummary?.sgstAmount)}</Text>
          <Text className="mt-1 text-sm text-slate-500">IGST: {formatMoney(invoice?.taxSummary?.igstAmount)}</Text>
          <Text className="mt-3 text-sm text-slate-500">Taxable amount: {formatMoney(invoice?.taxSummary?.taxableAmount)}</Text>
          <Text className="mt-1 text-sm text-slate-500">Delivery charges: {formatMoney(invoice?.taxSummary?.deliveryCharges)}</Text>
          <Text className="mt-1 text-lg font-semibold text-brand-700">Grand total: {formatMoney(invoice?.taxSummary?.grandTotal || invoice?.total)}</Text>
        </Card>

        <Card>
          <Text className="text-lg font-bold text-slate-900">Party details</Text>
          <Text className="mt-3 text-sm text-slate-500">Buyer: {invoice?.buyer?.name || 'N/A'}</Text>
          <Text className="mt-1 text-sm text-slate-500">Seller: {invoice?.seller?.name || 'N/A'}</Text>
          <Text className="mt-1 text-sm text-slate-500">Issue date: {invoice?.issueDate ? new Date(invoice.issueDate).toLocaleDateString() : 'N/A'}</Text>
          <Text className="mt-1 text-sm text-slate-500">Due date: {invoice?.dueDate ? new Date(invoice.dueDate).toLocaleDateString() : 'N/A'}</Text>
          {invoice?.meta?.linkedOrderId ? <Text className="mt-1 text-sm text-slate-500">Linked order: {invoice.meta.linkedOrderId}</Text> : null}
        </Card>

        {invoice?.items?.length ? (
          <Card>
            <Text className="text-lg font-bold text-slate-900">Line items</Text>
            {invoice.items.slice(0, 5).map((item, index) => (
              <View key={`${item.itemName || 'item'}-${index}`} className="mt-3 rounded-2xl bg-slate-50 p-3">
                <Text className="font-semibold text-slate-900">{item.itemName || 'Product item'}</Text>
                <Text className="mt-1 text-sm text-slate-500">
                  Qty {item.quantity || 0} {item.unit || ''} | HSN {item.hsnCode || 'N/A'}
                </Text>
                <Text className="mt-1 text-sm text-slate-500">Line total: {formatMoney(item.lineTotal)}</Text>
              </View>
            ))}
          </Card>
        ) : null}

        <Button label="Share / download PDF" onPress={sharePdf} />
      </View>
    </Screen>
  );
}
