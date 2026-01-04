import { Injectable, signal, computed } from '@angular/core';
import { Message, ChatSession } from '../../../core/models/chat.model';

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  // State
  private conversationsSig = signal<ChatSession[]>([]);
  private activeChatIdSig = signal<string | null>(null);

  // Selectors
  conversations = computed(() => this.conversationsSig());
  activeChat = computed(() => {
    const id = this.activeChatIdSig();
    return this.conversationsSig().find(c => c.id === id) || null;
  });

  constructor() {
    this.loadMockConversations();
  }

  loadMockConversations() {
    const MOCK_CHATS: ChatSession[] = [
      {
        id: '101',
        userId: '2',
        userAlias: 'Moussa',
        userPhotoUrl: '',
        lastMessage: 'On se voit ce soir ?',
        lastMessageTime: new Date(Date.now() - 3600000), // 1h ago
        unreadCount: 1,
        messages: [
          { id: 'm1', senderId: '2', content: 'Salut ! Ça va ?', timestamp: new Date(Date.now() - 86400000), isRead: true },
          { id: 'm2', senderId: 'me', content: 'Salut Moussa, ça va et toi ?', timestamp: new Date(Date.now() - 80000000), isRead: true },
          { id: 'm3', senderId: '2', content: 'On se voit ce soir ?', timestamp: new Date(Date.now() - 3600000), isRead: false }
        ]
      },
      {
        id: '102',
        userId: '3',
        userAlias: 'Fatou',
        lastMessage: 'Hahaha trop drôle 😂',
        lastMessageTime: new Date(Date.now() - 86400000 * 2),
        unreadCount: 0,
        messages: [
           { id: 'm1', senderId: 'me', content: 'Tu as vu le dernier film ?', timestamp: new Date(Date.now() - 86400000 * 2.1), isRead: true },
           { id: 'm2', senderId: '3', content: 'Hahaha trop drôle 😂', timestamp: new Date(Date.now() - 86400000 * 2), isRead: true }
        ]
      }
    ];
    this.conversationsSig.set(MOCK_CHATS);
  }

  setActiveChat(id: string) {
    this.activeChatIdSig.set(id);
    // Mark as read
    this.conversationsSig.update(list => 
      list.map(c => c.id === id ? { ...c, unreadCount: 0 } : c)
    );
  }

  sendMessage(content: string) {
    const activeId = this.activeChatIdSig();
    if (!activeId) return;

    const newMessage: Message = {
      id: Math.random().toString(36).substr(2, 9),
      senderId: 'me',
      content,
      timestamp: new Date(),
      isRead: true
    };

    this.conversationsSig.update(list => 
      list.map(c => {
        if (c.id === activeId) {
          return {
            ...c,
            lastMessage: content,
            lastMessageTime: new Date(),
            messages: [...c.messages, newMessage]
          };
        }
        return c;
      })
    );

    // Simulate reply after 2s
    setTimeout(() => {
      this.receiveMockReply(activeId);
    }, 2000);
  }

  private receiveMockReply(chatId: string) {
     const reply: Message = {
      id: Math.random().toString(36).substr(2, 9),
      senderId: 'other',
      content: 'Ceci est une réponse automatique simulée ! 😉',
      timestamp: new Date(),
      isRead: false
    };

    this.conversationsSig.update(list => 
      list.map(c => {
        if (c.id === chatId) {
          return {
            ...c,
            lastMessage: reply.content,
            lastMessageTime: new Date(),
            unreadCount: (this.activeChatIdSig() === chatId) ? 0 : c.unreadCount + 1,
            messages: [...c.messages, reply]
          };
        }
        return c;
      })
    );
  }
}
