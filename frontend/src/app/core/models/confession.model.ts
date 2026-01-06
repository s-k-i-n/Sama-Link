export interface Confession {
  id: string;
  content: string;
  authorId: string;
  authorAlias?: string; // Optional custom alias, defaults to "Anonyme"
  createdAt: Date;
  likes: number;
  commentsCount: number;
  isLiked: boolean; // Computed state for current user
  location?: string;
  imageUrl?: string;
  authorAvatar?: string;
  isMatched?: boolean;
  isAnonymous?: boolean;
  tags?: string[];
}
