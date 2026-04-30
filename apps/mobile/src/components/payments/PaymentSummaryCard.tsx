import { Text, View } from 'react-native';
import { Card } from '@/components/ui/Card';
import { MarketplaceProduct } from '@/types/models';

interface PaymentSummaryCardProps {
  product?: MarketplaceProduct;
}

export const PaymentSummaryCard = ({ product }: PaymentSummaryCardProps) => (
  <Card>
    <Text className="text-xs font-semibold uppercase tracking-[2px] text-slate-400">Order summary</Text>
    <Text className="mt-2 text-2xl font-black text-slate-900">{product?.title || 'Selected listing'}</Text>
    <Text className="mt-2 text-sm text-slate-500">{product?.category || 'Marketplace product'} - {product?.location || 'Location pending'}</Text>
    <View className="mt-4 flex-row items-end justify-between">
      <View>
        <Text className="text-sm text-slate-500">Payable now</Text>
        <Text className="mt-1 text-2xl font-black text-brand-700">Rs. {product?.price || 0}</Text>
      </View>
      <Text className="text-sm font-semibold text-slate-500">/{product?.unit || 'Kg'}</Text>
    </View>
    {product?.normalizedPricePerKg ? (
      <Text className="mt-2 text-xs text-slate-500">Normalized price: Rs. {product.normalizedPricePerKg} / Kg equivalent</Text>
    ) : null}
  </Card>
);
