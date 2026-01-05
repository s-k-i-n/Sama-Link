import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const connectionString = `${process.env.DATABASE_URL}`;

const pool = new pg.Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

export default prisma;

// Commentaire en français : 
// Ce fichier initialise le client Prisma avec l'adaptateur PostgreSQL (pg).
// Dans Prisma 7, l'adaptateur est requis pour une connexion directe si l'URL est dynamique.
