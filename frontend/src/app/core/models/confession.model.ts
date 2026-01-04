export interface Confession {
  id: string;
  content: string;
  authorAlias?: string; // Optional custom alias, defaults to "Anonyme"
  createdAt: Date;
  likes: number;
  commentsCount: number;
  isLiked: boolean; // Computed state for current user
  location?: string;
  tags?: string[];
}
