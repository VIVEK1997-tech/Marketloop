import { useQuery, useQueryClient } from '@tanstack/react-query';
import { router } from 'expo-router';
import { useEffect } from 'react';
import { Pressable, Text, View } from 'react-native';
import { StatusPill } from '@/components/payments/StatusPill';
import { SectionHeader } from '@/components/marketplace/SectionHeader';
import { Card } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { Screen } from '@/components/ui/Screen';
import { chatRepository } from '@/services/api/chat.repository';
import { getChatSocket } from '@/services/socket/chat-socket';
import { useAuthStore } from '@/store/auth-store';
import { useChatUiStore } from '@/store/chat-ui-store';
import { MessageItem } from '@/types/models';

export default function ChatInboxScreen() {
  const queryClient = useQueryClient();
  const user = useAuthStore((state) => state.user);
  const unreadByConversation = useChatUiStore((state) => state.unreadByConversation);
  const { data: conversations = [] } = useQuery({
    queryKey: ['conversations'],
    queryFn: chatRepository.getConversations
  });

  useEffect(() => {
    const socket = getChatSocket();
    if (!socket) return;

    const onMessage = (message: MessageItem) => {
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
      if (message.conversation) {
        useChatUiStore.getState().incrementUnread(String(message.conversation));
      }
    };

    socket.on('receiveMessage', onMessage);
    return () => {
      socket.off('receiveMessage', onMessage);
    };
  }, [queryClient]);

  return (
    <Screen>
      <View className="gap-4">
        <SectionHeader title="Chats" subtitle="Stay close to buyers and sellers with product-linked conversations." />
        {!conversations.length ? (
          <EmptyState title="No conversations yet" description="Start a chat from a product detail page to see it here." />
        ) : (
          conversations.map((conversation) => {
            const peer = conversation.participants.find((participant) => (participant._id || participant.id) !== user?.id);
            const unreadCount = unreadByConversation[conversation._id] || 0;
            return (
              <Pressable
                key={conversation._id}
                onPress={() => {
                  useChatUiStore.getState().markConversationRead(conversation._id);
                  router.push(`/chat/${conversation._id}`);
                }}
              >
                <Card>
                  <View className="gap-3">
                    <View className="flex-row items-start justify-between gap-3">
                      <View className="flex-1">
                        <Text className="text-lg font-bold text-slate-900">{peer?.name || conversation.product?.title || 'Conversation'}</Text>
                        <Text className="mt-1 text-sm text-slate-500">{conversation.product?.title || 'Open to continue chatting'}</Text>
                      </View>
                      <View className="items-end gap-2">
                        <StatusPill label={peer?.online ? 'Online' : 'Offline'} tone={peer?.online ? 'success' : 'neutral'} />
                        {unreadCount ? <StatusPill label={`${unreadCount} new`} tone="info" /> : null}
                      </View>
                    </View>
                    <Text className="text-sm text-slate-600">{conversation.lastMessage?.message || 'Open to continue chatting'}</Text>
                    <Text className="text-xs text-slate-400">{new Date(conversation.updatedAt).toLocaleString()}</Text>
                  </View>
                </Card>
              </Pressable>
            );
          })
        )}
      </View>
    </Screen>
  );
}
