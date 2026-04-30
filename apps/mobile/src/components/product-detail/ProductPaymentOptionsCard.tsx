import { Text, View } from 'react-native';
import { PaymentMethodCard } from '@/components/payments/PaymentMethodCard';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { PaymentGateway } from '@/features/payments/payment-service';

interface ProductPaymentOptionsCardProps {
  selectedGateway: PaymentGateway;
  onSelectGateway: (gateway: PaymentGateway) => void;
  onContinue: () => void;
  loading?: boolean;
}

const gateways: Array<{ key: PaymentGateway; title: string; subtitle: string; methods: string; helperText: string }> = [
  {
    key: 'razorpay',
    title: 'Razorpay',
    subtitle: 'Primary Marketloop checkout for UPI, cards, wallets, and net banking.',
    methods: 'UPI / Cards / Wallets / Net Banking',
    helperText: 'Best for the fastest checkout and the widest payment coverage'
  },
  {
    key: 'payu',
    title: 'PayU',
    subtitle: 'Fallback Marketloop gateway for UPI, cards, and net banking.',
    methods: 'UPI / Cards / Net Banking',
    helperText: 'Useful backup when you want a second checkout route'
  }
];

export const ProductPaymentOptionsCard = ({
  selectedGateway,
  onSelectGateway,
  onContinue,
  loading = false
}: ProductPaymentOptionsCardProps) => {
  const selectedOption = gateways.find((gateway) => gateway.key === selectedGateway) || gateways[0];

  return (
    <Card>
      <Text className="text-lg font-bold text-slate-900">Pay with Marketloop checkout</Text>
      <Text className="mt-2 text-sm leading-6 text-slate-500">Choose the gateway available on Marketloop before you proceed to the buyer payment flow.</Text>
      <View className="mt-4 gap-3">
      {gateways.map((gateway) => (
        <PaymentMethodCard
          key={gateway.key}
          title={gateway.title}
          subtitle={gateway.subtitle}
          methods={gateway.methods}
          selected={selectedGateway === gateway.key}
          onPress={() => onSelectGateway(gateway.key)}
          helperText={gateway.helperText}
        />
      ))}
      </View>
      <View className="mt-4 rounded-2xl bg-slate-50 p-3">
        <Text className="text-xs font-semibold uppercase tracking-[1.5px] text-slate-400">Selected gateway</Text>
        <Text className="mt-1 text-base font-bold text-slate-900">{selectedOption.title}</Text>
        <Text className="mt-1 text-sm leading-6 text-slate-500">
          Marketloop will carry this choice into checkout, payment session creation, and payment retry recovery.
        </Text>
      </View>
      <View className="mt-4 gap-3">
        <Button label={`Continue with ${selectedOption.title}`} onPress={onContinue} loading={loading} />
        <Text className="text-center text-xs text-slate-500">You can switch gateways again during checkout if you want.</Text>
      </View>
    </Card>
  );
};
