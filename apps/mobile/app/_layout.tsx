import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { AppProviders } from '@/providers/AppProviders';

export default function RootLayout() {
  return (
    <AppProviders>
      <StatusBar style="dark" />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="onboarding" />
        <Stack.Screen name="login" />
        <Stack.Screen name="register" />
        <Stack.Screen name="verify-otp" />
        <Stack.Screen name="admin-home" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="product/[id]" />
        <Stack.Screen name="checkout/[productId]" />
        <Stack.Screen name="payments/result" />
        <Stack.Screen name="orders/[orderId]" />
        <Stack.Screen name="invoices/index" />
        <Stack.Screen name="invoices/[invoiceId]" />
        <Stack.Screen name="payments/history" />
        <Stack.Screen name="notifications" />
        <Stack.Screen name="support/index" />
        <Stack.Screen name="support/[complaintId]" />
        <Stack.Screen name="chat/index" />
        <Stack.Screen name="chat/[conversationId]" />
        <Stack.Screen name="seller/listing-form" />
      </Stack>
    </AppProviders>
  );
}
