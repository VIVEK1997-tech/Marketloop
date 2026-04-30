import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useLocalSearchParams } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { FlatList, Text, TextInput, View } from 'react-native';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Screen } from '@/components/ui/Screen';
import { chatRepository } from '@/services/api/chat.repository';
import { getChatSocket } from '@/services/socket/chat-socket';
import { useAuthStore } from '@/store/auth-store';
import { useChatUiStore } from '@/store/chat-ui-store';
import { MessageItem } from '@/types/models';

export default function ChatThreadScreen() {
  const { conversationId } = useLocalSearchParams<{ conversationId: string }>();
  const queryClient = useQueryClient();
  const user = useAuthStore((state) => state.user);
  const [draft, setDraft] = useState('');
  const [isTypingPeer, setIsTypingPeer] = useState(false);
  const { data: conversations = [] } = useQuery({
    queryKey: ['conversations'],
    queryFn: chatRepository.getConversations
  });
  const { data: messages = [] } = useQuery({
    queryKey: ['messages', conversationId],
    queryFn: () => chatRepository.getMessages(String(conversationId)),
    enabled: !!conversationId
  });

  const conversation = useMemo(
    () => conversations.find((item) => item._id === String(conversationId)),
    [conversations, conversationId]
  );

  useEffect(() => {
    if (!conversationId) return;
    useChatUiStore.getState().setActiveConversation(String(conversationId));
    useChatUiStore.getState().markConversationRead(String(conversationId));
    return () => {
      useChatUiStore.getState().setActiveConversation(null);
    };
  }, [conversationId]);

  useEffect(() => {
    const socket = getChatSocket();
    if (!socket || !conversationId) return;
    socket.emit('joinConversation', { conversationId });

    const onMessage = (message: MessageItem) => {
      if (String(message.conversation) === String(conversationId)) {
        queryClient.invalidateQueries({ queryKey: ['messages', conversationId] });
      }
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    };

    const onTyping = ({ conversationId: incomingConversationId, userId, isTyping }: { conversationId: string; userId: string; isTyping: boolean }) => {
      if (String(incomingConversationId) !== String(conversationId)) return;
      if (userId === user?.id) return;
      setIsTypingPeer(isTyping);
    };

    socket.on('receiveMessage', onMessage);
    socket.on('typing', onTyping);
    return () => {
      socket.off('receiveMessage', onMessage);
      socket.off('typing', onTyping);
      socket.emit('typing', { conversationId, isTyping: false });
    };
  }, [conversationId, queryClient, user?.id]);

  const sendTypingState = (value: string) => {
    setDraft(value);
    const socket = getChatSocket();
    socket?.emit('typing', { conversationId, isTyping: value.trim().length > 0 });
  };

  const sendMessage = async () => {
    if (!draft.trim()) return;
    await chatRepository.sendMessage(String(conversationId), draft.trim());
    setDraft('');
    setIsTypingPeer(false);
    const socket = getChatSocket();
    socket?.emit('typing', { conversationId, isTyping: false });
    queryClient.invalidateQueries({ queryKey: ['messages', conversationId] });
    queryClient.invalidateQueries({ queryKey: ['conversations'] });
  };

  return (
    <Screen scroll={false}>
      <View className="flex-1 gap-3">
        <Card>
          <Text className="text-2xl font-black text-slate-900">{conversation?.product?.title || 'Conversation'}</Text>
          <Text className="mt-1 text-sm text-slate-500">
            {conversation?.participants.find((participant) => (participant._id || participant.id) !== user?.id)?.name || 'MarketLoop chat'}
          </Text>
          {isTypingPeer ? <Text className="mt-2 text-xs font-medium text-brand-700">Typing…</Text> : null}
        </Card>

        <FlatList
          data={messages}
          keyExtractor={(item) => item._id}
          renderItem={({ item }) => {
            const isMine = (item.sender?._id || item.sender?.id) === user?.id;
            return (
              <View className={`rounded-2xl p-3 ${isMine ? 'self-end bg-brand-600' : 'self-start bg-white'}`}>
                <Text className={`text-xs font-semibold ${isMine ? 'text-emerald-100' : 'text-slate-400'}`}>
                  {isMine ? 'You' : item.sender?.name || 'User'}
                </Text>
                <Text className={`mt-1 text-base ${isMine ? 'text-white' : 'text-slate-900'}`}>{item.message}</Text>
                <Text className={`mt-2 text-xs ${isMine ? 'text-emerald-100' : 'text-slate-400'}`}>{new Date(item.createdAt).toLocaleTimeString()}</Text>
              </View>
            );
          }}
          contentContainerStyle={{ gap: 12, paddingBottom: 12 }}
        />

        <View className="gap-3 rounded-3xl border border-slate-200 bg-white p-3">
          <TextInput
            value={draft}
            onChangeText={sendTypingState}
            placeholder="Type a message..."
            className="rounded-2xl border border-slate-200 px-4 py-3"
          />
          <Button label="Send" onPress={sendMessage} />
        </View>
      </View>
    </Screen>
  );
}
