import { router } from 'expo-router';
import { useState } from 'react';
import { Text, View } from 'react-native';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Screen } from '@/components/ui/Screen';
import { useAuthStore } from '@/store/auth-store';
import { getApiErrorMessage } from '@/services/api/client';

export default function LoginScreen() {
  const login = useAuthStore((state) => state.login);
  const user = useAuthStore((state) => state.user);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    try {
      setLoading(true);
      setError('');
      await login({ email, password });
      const nextRole = useAuthStore.getState().user?.activeRole || useAuthStore.getState().user?.role || user?.activeRole || user?.role;
      router.replace(nextRole === 'admin' ? '/admin-home' : '/(tabs)/home');
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
          <Text className="text-sm font-black uppercase tracking-widest text-brand-700">Welcome back</Text>
          <Text className="mt-3 text-4xl font-black text-slate-900">Login</Text>
          <Text className="mt-2 text-base leading-6 text-slate-500">Sign in to continue your Marketloop grocery shopping, orders, invoices, and seller conversations.</Text>
        </View>

        <Card>
          <View className="gap-4">
            <Input value={email} onChangeText={setEmail} autoCapitalize="none" placeholder="Email or phone number" />
            <Input value={password} onChangeText={setPassword} secureTextEntry placeholder="Password or OTP placeholder" />
          </View>
        </Card>

        <Card>
          <Text className="text-sm font-semibold text-slate-700">Trust signals</Text>
          <Text className="mt-2 text-sm text-slate-500">Fast delivery • Fresh products • Secure payment gateways</Text>
        </Card>
        {error ? <Text className="text-sm text-rose-600">{error}</Text> : null}
        <Button label="Sign in" onPress={handleSubmit} disabled={loading} loading={loading} />
        <Button label="Continue with Google" variant="secondary" onPress={() => setError('Google login UI is ready, backend auth handoff can be connected next.')} />
        <Button label="Create account" variant="secondary" onPress={() => router.push('/register')} />
      </View>
    </Screen>
  );
}
