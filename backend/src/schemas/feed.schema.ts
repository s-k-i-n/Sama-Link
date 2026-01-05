import { z } from 'zod';

export const createConfessionSchema = z.object({
  content: z.string().min(1, "La confession ne peut pas être vide.")
    .max(500, "La confession ne peut pas dépasser 500 caractères."),
  location: z.string().optional(),
  isAnonymous: z.union([z.boolean(), z.string()]).transform((val) => {
    if (typeof val === 'string') return val === 'true';
    return val;
  }).optional()
});

export const updateConfessionSchema = z.object({
  content: z.string().min(1, "Le contenu ne peut pas être vide.")
    .max(500, "Le contenu ne peut pas dépasser 500 caractères.")
});

export const getConfessionsQuerySchema = z.object({
  filter: z.enum(['recent', 'popular', 'nearby', 'mine']).optional(),
  page: z.string().optional().transform((val) => val ? Number(val) : undefined).pipe(z.number().min(1).optional()),
  limit: z.string().optional().transform((val) => val ? Number(val) : undefined).pipe(z.number().min(1).max(100).optional()),
  userId: z.string().optional() // Utilisé pour le filtre 'mine'
});
