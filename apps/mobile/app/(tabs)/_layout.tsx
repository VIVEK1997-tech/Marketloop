import { FontAwesome } from '@expo/vector-icons';
import { Redirect, Tabs } from 'expo-router';
import { useAuthStore } from '@/store/auth-store';
import { useCartStore } from '@/store/cart-store';

export default function TabsLayout() {
  const user = useAuthStore((state) => state.user);
  const cartCount = useCartStore((state) => state.items.reduce((sum, item) => sum + item.quantity, 0));

  if (!user) return <Redirect href="/login" />;

  const role = user.activeRole || user.role;
  const isBuyer = role === 'buyer';
  const isSeller = role === 'seller';
  const isAdmin = role === 'admin';

  if (isAdmin) return <Redirect href="/admin-home" />;

  return (
    <Tabs screenOptions={{ headerShown: false, tabBarActiveTintColor: '#059669', tabBarLabelStyle: { fontWeight: '700' } }}>
      <Tabs.Screen name="home" options={{ title: 'Home', href: undefined, tabBarIcon: ({ color }) => <FontAwesome size={18} name="home" color={color} /> }} />
      <Tabs.Screen name="search" options={{ title: 'Categories', href: isBuyer ? undefined : null, tabBarIcon: ({ color }) => <FontAwesome size={18} name="th-large" color={color} /> }} />
      <Tabs.Screen
        name="cart"
        options={{
          title: 'Cart',
          href: isBuyer ? undefined : null,
          tabBarBadge: cartCount ? cartCount : undefined,
          tabBarIcon: ({ color }) => <FontAwesome size={18} name="shopping-cart" color={color} />
        }}
      />
      <Tabs.Screen name="orders" options={{ title: 'Orders', tabBarIcon: ({ color }) => <FontAwesome size={18} name="list-alt" color={color} /> }} />
      <Tabs.Screen name="wishlist" options={{ title: 'Wishlist', href: null, tabBarIcon: ({ color }) => <FontAwesome size={18} name="heart" color={color} /> }} />
      <Tabs.Screen name="dashboard" options={{ title: 'Dashboard', href: null, tabBarIcon: ({ color }) => <FontAwesome size={18} name="bar-chart" color={color} /> }} />
      <Tabs.Screen name="listings" options={{ title: 'Listings', href: isSeller ? undefined : null, tabBarIcon: ({ color }) => <FontAwesome size={18} name="th-large" color={color} /> }} />
      <Tabs.Screen name="finance" options={{ title: 'Finance', href: isSeller ? undefined : null, tabBarIcon: ({ color }) => <FontAwesome size={18} name="money" color={color} /> }} />
      <Tabs.Screen name="profile" options={{ title: 'Profile', tabBarIcon: ({ color }) => <FontAwesome size={18} name="user" color={color} /> }} />
    </Tabs>
  );
}
