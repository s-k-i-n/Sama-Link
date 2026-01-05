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
    // TODO: Connect to Real Backend
    this.conversationsSig.set([]);
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

}
}
