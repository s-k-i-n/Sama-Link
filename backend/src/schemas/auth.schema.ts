import { z } from 'zod';

export const registerSchema = z.object({
  email: z.string().email({ message: "Format d'email invalide." }),
  password: z.string().min(8, { message: "Le mot de passe doit faire au moins 8 caractères." }),
  username: z.string().min(3, { message: "Le nom d'utilisateur doit faire au moins 3 caractères." })
    .max(20, { message: "Le nom d'utilisateur est trop long." })
    .regex(/^[a-zA-Z0-9_]+$/, { message: "Le nom d'utilisateur ne peut contenir que des lettres, chiffres et underscores." })
});

export const loginSchema = z.object({
  email: z.string().email({ message: "Format d'email invalide." }),
  password: z.string().min(1, { message: "Le mot de passe est requis." })
});
