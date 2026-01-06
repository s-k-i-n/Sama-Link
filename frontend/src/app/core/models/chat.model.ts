export interface Message {
  id: string;
  senderId: string;
  content: string;
  type?: 'TEXT' | 'IMAGE' | 'AUDIO';
  metadata?: any;
  timestamp: Date;
  isRead: boolean;
}

export interface ChatSession {
  id: string; // Match ID
  userId: string; // Other user ID
  userAlias: string;
  userPhotoUrl?: string;
  lastMessage?: string;
  lastMessageTime?: Date;
  unreadCount: number;
  messages: Message[];
  isTyping?: boolean; // UI state
}
