import { z } from 'zod';

// Regex pour téléphone sénégalais: +221 ou 00221 suivi de 70, 75, 76, 77, 78 et 7 chiffres
const phoneRegex = /^(?:\+221|00221)?(?:7[05678][0-9]{7})$/;

export const registerSchema = z.object({
  email: z.string().email("Email invalide").optional(),
  phone: z.string().regex(phoneRegex, "Numéro de téléphone invalide (Ex: 77 123 45 67)").optional(),
  username: z.string().min(3, "Nom d'utilisateur trop court (min 3 car.)"),
  password: z.string().min(6, "Mot de passe trop court (min 6 car.)"),
}).refine(data => data.email || data.phone, {
  message: "Email ou téléphone requis",
  path: ["email"]
});

export const loginSchema = z.object({
  identifier: z.string().min(1, "Email, téléphone ou nom d'utilisateur requis"),
  password: z.string().min(1, { message: "Le mot de passe est requis." })
});
