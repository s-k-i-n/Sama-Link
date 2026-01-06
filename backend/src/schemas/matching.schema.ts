import { z } from 'zod';

export const swipeSchema = z.object({
  targetUserId: z.string().uuid({ message: "ID de l'utilisateur cible invalide." }),
  direction: z.enum(['like', 'pass', 'superlike'], { message: "La direction doit être 'like', 'pass' ou 'superlike'." })
});

export type SwipeInput = z.infer<typeof swipeSchema>;
