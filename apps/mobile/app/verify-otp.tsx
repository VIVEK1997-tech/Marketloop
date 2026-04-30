import { router } from 'expo-router';
import { useState } from 'react';
import { Text, View } from 'react-native';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Screen } from '@/components/ui/Screen';
import { useAuthStore } from '@/store/auth-store';
import { getApiErrorMessage } from '@/services/api/client';

export default function VerifyOtpScreen() {
  const pendingEmail = useAuthStore((state) => state.pendingVerificationEmail);
  const verifyOtp = useAuthStore((state) => state.verifyOtp);
  const resendOtp = useAuthStore((state) => state.resendOtp);
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');

  const handleVerify = async () => {
    try {
      setError('');
      await verifyOtp({ email: pendingEmail, otp });
      router.replace('/login');
    } catch (err) {
      setError(getApiErrorMessage(err));
    }
  };

  return (
    <Screen>
      <View className="gap-5 pt-8">
        <View>
          <Text className="text-sm font-black uppercase tracking-widest text-brand-700">Almost there</Text>
          <Text className="mt-3 text-4xl font-black text-slate-900">Verify OTP</Text>
          <Text className="mt-2 text-sm text-slate-500">We sent a 6-digit code to {pendingEmail || 'your email'}.</Text>
        </View>
        <Card>
          <Input value={otp} onChangeText={setOtp} keyboardType="number-pad" placeholder="Enter OTP" />
        </Card>
        {error ? <Text className="text-sm text-rose-600">{error}</Text> : null}
        <Button label="Verify" onPress={handleVerify} />
        <Button label="Resend OTP" variant="secondary" onPress={() => resendOtp(pendingEmail)} />
      </View>
    </Screen>
  );
}
