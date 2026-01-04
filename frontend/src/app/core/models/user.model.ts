export interface User {
  id: string;
  username: string;
  age: number;
  gender: 'male' | 'female' | 'other';
  location: string;
  bio: string;
  profilePhotoUrl?: string; // Optional, maybe default avatar
  interests: string[];
  isPremium?: boolean;
  occupation?: string;
  education?: string;
  compatibilityScore?: number; // Match percentage
  distance?: number; // km
}

export interface Match {
  id: string;
  users: [User, User];
  createdAt: Date;
  lastMessage?: string;
  lastMessageTime?: Date;
  unreadCount: number;
}
