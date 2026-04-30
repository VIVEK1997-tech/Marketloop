import { Text, View } from 'react-native';
import { Card } from '@/components/ui/Card';
import { MarketplaceProduct } from '@/types/models';
import { formatCurrency, getProductDiscount } from '@/theme/marketloop';

interface ProductOverviewCardProps {
  product: MarketplaceProduct;
}

export const ProductOverviewCard = ({ product }: ProductOverviewCardProps) => {
  const { discount, originalPrice } = getProductDiscount(product._id, product.price);

  return (
    <Card>
      <View className="gap-3">
        <View className="self-start rounded-full bg-amber-100 px-3 py-1">
          <Text className="text-xs font-bold text-amber-700">{discount}% OFF</Text>
        </View>
        <Text className="text-3xl font-black text-slate-900">{product.title}</Text>
        <Text className="text-sm text-slate-500">{product.category} • {product.location}</Text>
        <View className="flex-row items-center gap-3">
          <Text className="text-2xl font-black text-slate-900">{formatCurrency(product.price)}</Text>
          <Text className="text-base text-slate-400 line-through">{formatCurrency(originalPrice)}</Text>
        </View>
        <Text className="text-sm text-slate-500">{product.quantity || 1} {product.unit || 'unit'}</Text>
        {product.normalizedPricePerKg ? (
          <Text className="text-sm font-medium text-brand-700">{formatCurrency(product.normalizedPricePerKg)} per Kg equivalent</Text>
        ) : null}
        <Text className="text-base leading-7 text-slate-600">{product.description}</Text>
      </View>
    </Card>
  );
};
