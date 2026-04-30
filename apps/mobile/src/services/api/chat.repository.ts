import { apiClient } from './client';
import { ConversationSummary, MessageItem } from '@/types/models';

export const chatRepository = {
  getConversations: async () => {
    const { data } = await apiClient.get<{ conversations: ConversationSummary[] }>('/chats/conversations');
    return data.conversations || [];
  },
  createConversation: async (sellerId: string, productId: string) => {
    const { data } = await apiClient.post<{ conversation: ConversationSummary }>('/chats/conversations', { sellerId, productId });
    return data.conversation;
  },
  getMessages: async (conversationId: string) => {
    const { data } = await apiClient.get<{ messages: MessageItem[] }>(`/chats/conversations/${conversationId}/messages`);
    return data.messages || [];
  },
  sendMessage: async (conversationId: string, message: string) => {
    const { data } = await apiClient.post<{ message: MessageItem }>(`/chats/conversations/${conversationId}/messages`, { message });
    return data.message;
  }
};
