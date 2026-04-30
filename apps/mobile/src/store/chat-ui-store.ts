import { create } from 'zustand';

interface ChatUiState {
  activeConversationId: string | null;
  unreadByConversation: Record<string, number>;
  setActiveConversation: (conversationId: string | null) => void;
  incrementUnread: (conversationId: string) => void;
  markConversationRead: (conversationId: string) => void;
  resetUnread: () => void;
}

export const useChatUiStore = create<ChatUiState>((set, get) => ({
  activeConversationId: null,
  unreadByConversation: {},
  setActiveConversation: (conversationId) => set({ activeConversationId: conversationId }),
  incrementUnread: (conversationId) => {
    if (!conversationId) return;
    if (get().activeConversationId === conversationId) return;
    set((state) => ({
      unreadByConversation: {
        ...state.unreadByConversation,
        [conversationId]: (state.unreadByConversation[conversationId] || 0) + 1
      }
    }));
  },
  markConversationRead: (conversationId) =>
    set((state) => ({
      unreadByConversation: {
        ...state.unreadByConversation,
        [conversationId]: 0
      }
    })),
  resetUnread: () => set({ unreadByConversation: {} })
}));
