import { z } from 'zod';

export const swipeSchema = z.object({
  targetUserId: z.string().uuid({ message: "ID de l'utilisateur cible invalide." }),
  direction: z.enum(['like', 'pass'], { message: "La direction doit être 'like' ou 'pass'." })
});

export type SwipeInput = z.infer<typeof swipeSchema>;
