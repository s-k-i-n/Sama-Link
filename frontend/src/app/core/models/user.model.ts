export interface User {
  id: string;
  username: string;
  email?: string;
  phone?: string;
  age?: number;
  birthDate?: string;
  gender: 'male' | 'female' | 'other' | string;
  location: string;
  bio: string;
  
  // Media
  avatarUrl?: string; // Main photo
  photos?: string[]; // Gallery

  // Details
  height?: number;
  jobTitle?: string;
  company?: string;
  school?: string;
  educationLevel?: string;
  religion?: string;
  drinking?: string;
  smoking?: string;
  children?: string;
  languages?: string[];
  zodiacSign?: string;

  interests: string[]; // Or detailed object
  
  isPremium?: boolean;
  isVerified?: boolean;
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
