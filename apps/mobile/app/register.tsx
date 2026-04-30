import { router } from 'expo-router';
import { useState } from 'react';
import { Text, View } from 'react-native';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Screen } from '@/components/ui/Screen';
import { useAuthStore } from '@/store/auth-store';
import { getApiErrorMessage } from '@/services/api/client';

export default function RegisterScreen() {
  const register = useAuthStore((state) => state.register);
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '', role: 'buyer' as 'buyer' | 'seller' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const updateField = (key: keyof typeof form, value: string) => setForm((current) => ({ ...current, [key]: value }));

  const handleSubmit = async () => {
    try {
      setLoading(true);
      setError('');
      await register(form);
      router.push('/verify-otp');
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen>
      <View className="gap-5 pt-8">
        <View>
          <Text className="text-sm font-black uppercase tracking-widest text-brand-700">Join Marketloop</Text>
          <Text className="mt-3 text-4xl font-black text-slate-900">Create your account</Text>
        </View>
        <Card>
          <View className="gap-4">
            <Input value={form.name} onChangeText={(value) => updateField('name', value)} placeholder="Full name" />
            <Input value={form.email} onChangeText={(value) => updateField('email', value)} autoCapitalize="none" placeholder="Email address" />
            <Input value={form.phone} onChangeText={(value) => updateField('phone', value)} keyboardType="phone-pad" placeholder="Phone number" />
            <Input value={form.password} onChangeText={(value) => updateField('password', value)} secureTextEntry placeholder="Create password" />
          </View>
        </Card>
        <View className="flex-row gap-3">
          <Button label={`Shopping as: ${form.role}`} variant="secondary" onPress={() => updateField('role', form.role === 'buyer' ? 'seller' : 'buyer')} />
        </View>
        {error ? <Text className="text-sm text-rose-600">{error}</Text> : null}
        <Button label="Register" onPress={handleSubmit} disabled={loading} loading={loading} />
        <Button label="Already have an account? Login" variant="secondary" onPress={() => router.push('/login')} />
      </View>
    </Screen>
  );
}
