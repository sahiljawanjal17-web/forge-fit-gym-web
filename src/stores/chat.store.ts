import { create } from 'zustand';

interface ChatState {
  activeConversationId: string | null;
  unreadCounts: Record<string, number>;
  typingUsers: Record<string, string[]>;
  setActiveConversation: (id: string | null) => void;
  updateUnreadCount: (conversationId: string, count: number) => void;
  setTypingUsers: (conversationId: string, users: string[]) => void;
}

export const useChatStore = create<ChatState>((set) => ({
  activeConversationId: null,
  unreadCounts: {},
  typingUsers: {},
  setActiveConversation: (id) => set({ activeConversationId: id }),
  updateUnreadCount: (conversationId, count) =>
    set((state) => ({
      unreadCounts: {
        ...state.unreadCounts,
        [conversationId]: count,
      },
    })),
  setTypingUsers: (conversationId, users) =>
    set((state) => ({
      typingUsers: {
        ...state.typingUsers,
        [conversationId]: users,
      },
    })),
}));
