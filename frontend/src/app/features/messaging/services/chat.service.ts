import { Injectable, signal, computed, inject, OnDestroy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { io, Socket } from 'socket.io-client';
import { environment } from '../../../../environments/environment';
import { Message, ChatSession } from '../../../core/models/chat.model';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../core/services/toast.service';
import { StorageService } from '../../../core/services/storage.service';
import { tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ChatService implements OnDestroy {
  private http = inject(HttpClient);
  private authService = inject(AuthService);
  private toastService = inject(ToastService);
  private storageService = inject(StorageService);
  private apiUrl = `${environment.apiUrl}/messaging`;
  private socket!: Socket;

  // State
  private conversationsSig = signal<ChatSession[]>([]);
  private activeChatIdSig = signal<string | null>(null);
  private isLoadingConversationsSig = signal(false);

  // Selectors
  conversations = computed(() => this.conversationsSig());
  activeChatId = computed(() => this.activeChatIdSig());
  activeChat = computed(() => {
    const id = this.activeChatIdSig();
    return this.conversationsSig().find(c => c.id === id) || null;
  });

  constructor() {
    this.initSocket();
    this.loadConversations();
  }

  private initSocket() {
    this.socket = io(environment.apiUrl, {
      auth: { token: this.storageService.getItem('access_token') }
    });

    this.socket.on('connect', () => console.log('Connecté au serveur Socket.io 💬'));

    this.socket.on('new_message', (msg: any) => {
      this.handleNewMessage(msg);
    });

    this.socket.on('user_typing', (data: any) => {
        this.updateTypingStatus(data.conversationId, data.isTyping);
    });
  }

  loadConversations() {
    this.isLoadingConversationsSig.set(true);
    this.http.get<any[]>(`${this.apiUrl}/conversations`).subscribe({
      next: (data) => {
        const chatSessions: ChatSession[] = data.map(conv => ({
          id: conv.id,
          userId: conv.partner.id,
          userAlias: conv.partner.username,
          userPhotoUrl: conv.partner.avatarUrl,
          lastMessage: conv.lastMessage,
          lastMessageTime: new Date(conv.lastMessageAt),
          unreadCount: conv.unread ? 1 : 0, // Simplification
          messages: []
        }));
        this.conversationsSig.set(chatSessions);
        this.isLoadingConversationsSig.set(false);
      },
      error: () => this.isLoadingConversationsSig.set(false)
    });
  }

  setActiveChat(conversationId: string) {
    this.activeChatIdSig.set(conversationId);
    this.socket.emit('join_conversation', conversationId);
    
    // Charger les messages si pas déjà chargés
    const conversation = this.conversationsSig().find(c => c.id === conversationId);
    if (conversation && conversation.messages.length === 0) {
      this.loadMessages(conversationId);
    }

    // Mark as read localement
    this.conversationsSig.update(list => 
      list.map(c => c.id === conversationId ? { ...c, unreadCount: 0 } : c)
    );
  }

  loadMessages(conversationId: string) {
    this.http.get<any[]>(`${this.apiUrl}/messages/${conversationId}`).subscribe({
      next: (data) => {
        const messages: Message[] = data.map(m => ({
          id: m.id,
          senderId: m.senderId,
          content: m.content,
          timestamp: new Date(m.createdAt),
          isRead: !!m.readAt
        }));
        
        this.conversationsSig.update(list => 
          list.map(c => c.id === conversationId ? { ...c, messages } : c)
        );
      }
    });
  }

  uploadMedia(file: File) {
      const formData = new FormData();
      formData.append('file', file);
      return this.http.post<{ url: string, type: string, metadata: any }>(`${this.apiUrl}/upload`, formData);
  }

  getIcebreakers(targetUserId: string) {
      return this.http.get<string[]>(`${this.apiUrl}/icebreakers/${targetUserId}`);
  }

  sendMessage(content: string, type: string = 'TEXT', metadata: any = {}) {
    const activeId = this.activeChatIdSig();
    const user = this.authService.currentUser();
    const activeChat = this.activeChat();
    
    if (!activeId || !user || !activeChat) return;

    const messageData = {
      conversationId: activeId,
      senderId: user.id,
      receiverId: activeChat.userId,
      content,
      type,
      metadata
    };

    this.socket.emit('send_message', messageData);
  }

  sendTypingStatus(isTyping: boolean) {
    const activeId = this.activeChatIdSig();
    const user = this.authService.currentUser();
    if (!activeId || !user) return;

    this.socket.emit('typing', {
      conversationId: activeId,
      username: user.username,
      isTyping
    });
  }

  private handleNewMessage(msg: any) {
    this.conversationsSig.update(list => 
      list.map(c => {
        if (c.id === msg.conversationId) {
          const newMessage: Message = {
            id: msg.id,
            senderId: msg.senderId,
            content: msg.content,
            type: msg.type,
            metadata: msg.metadata,
            timestamp: new Date(msg.createdAt),
            isRead: !!msg.readAt
          };
          return {
            ...c,
            lastMessage: msg.content,
            lastMessageTime: new Date(msg.createdAt),
            unreadCount: (msg.conversationId !== this.activeChatIdSig()) ? c.unreadCount + 1 : 0,
            messages: [...c.messages, newMessage]
          };
        }
        return c;
      })
    );
  }

  private updateTypingStatus(conversationId: string, isTyping: boolean) {
    this.conversationsSig.update(list => 
      list.map(c => c.id === conversationId ? { ...c, isTyping } : c)
    );
  }

  ngOnDestroy() {
    if (this.socket) this.socket.disconnect();
  }
}
