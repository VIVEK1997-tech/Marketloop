import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Text, View } from 'react-native';
import { SectionHeader } from '@/components/marketplace/SectionHeader';
import { StatusPill } from '@/components/payments/StatusPill';
import { Card } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { Screen } from '@/components/ui/Screen';
import { Button } from '@/components/ui/Button';
import { userRepository } from '@/services/api/user.repository';

const getTone = (type?: string) => {
  const normalized = String(type || '').toLowerCase();
  if (normalized === 'success') return 'success' as const;
  if (normalized === 'warning') return 'warning' as const;
  if (normalized === 'danger') return 'danger' as const;
  return 'info' as const;
};

export default function NotificationsScreen() {
  const queryClient = useQueryClient();
  const { data: notifications = [] } = useQuery({
    queryKey: ['notifications'],
    queryFn: userRepository.getNotifications
  });

  const markReadMutation = useMutation({
    mutationFn: (notificationId: string) => userRepository.markNotificationRead(notificationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    }
  });

  return (
    <Screen>
      <View className="gap-5">
        <SectionHeader title="Notifications" subtitle="Review payment, invoice, chat, and profile alerts from your mobile workspace." />
        {!notifications.length ? (
          <EmptyState title="No notifications yet" description="New alerts will appear here as chat, payment, and invoice events arrive." />
        ) : (
          notifications.map((notification) => (
            <Card key={notification._id}>
              <View className="gap-3">
                <View className="flex-row items-start justify-between gap-3">
                  <View className="flex-1">
                    <Text className="text-lg font-bold text-slate-900">{notification.title}</Text>
                    <Text className="mt-1 text-sm text-slate-500">{notification.message}</Text>
                  </View>
                  <View className="items-end gap-2">
                    <StatusPill label={notification.type} tone={getTone(notification.type)} />
                    <StatusPill label={notification.read ? 'Read' : 'Unread'} tone={notification.read ? 'neutral' : 'warning'} />
                  </View>
                </View>
                <Text className="text-xs text-slate-400">{new Date(notification.createdAt).toLocaleString()}</Text>
                {!notification.read ? (
                  <Button
                    label={markReadMutation.isPending ? 'Updating...' : 'Mark as read'}
                    variant="secondary"
                    onPress={() => markReadMutation.mutate(notification._id)}
                    disabled={markReadMutation.isPending}
                  />
                ) : null}
              </View>
            </Card>
          ))
        )}
      </View>
    </Screen>
  );
}
