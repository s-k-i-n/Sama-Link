import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const connectionString = `${process.env.DATABASE_URL}`;
const pool = new pg.Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const interests = [
  // Sport
  { name: 'Football', category: 'Sport', icon: '⚽' },
  { name: 'Basketball', category: 'Sport', icon: '🏀' },
  { name: 'Tennis', category: 'Sport', icon: '🎾' },
  { name: 'Natation', category: 'Sport', icon: '🏊' },
  { name: 'Yoga', category: 'Sport', icon: '🧘' },
  { name: 'Musculation', category: 'Sport', icon: '💪' },
  { name: 'Randonnée', category: 'Sport', icon: '🥾' },
  { name: 'Running', category: 'Sport', icon: '🏃' },
  
  // Musique
  { name: 'Afrobeats', category: 'Music', icon: '🎵' },
  { name: 'Hip Hop', category: 'Music', icon: '🎤' },
  { name: 'Mbalax', category: 'Music', icon: '🥁' },
  { name: 'Pop', category: 'Music', icon: '🎸' },
  { name: 'Jazz', category: 'Music', icon: '🎷' },
  { name: 'Reggae', category: 'Music', icon: '🇯🇲' },

  // Cuisine & Sorties
  { name: 'Ceebu Jëf', category: 'Food', icon: '🥘' },
  { name: 'Sushi', category: 'Food', icon: '🍣' },
  { name: 'Pizza', category: 'Food', icon: '🍕' },
  { name: 'Café', category: 'Food', icon: '☕' },
  { name: 'Brunch', category: 'Food', icon: '🥞' },
  { name: 'Cuisine', category: 'Food', icon: '👨‍🍳' },

  // Loisirs & Culture
  { name: 'Voyage', category: 'Hobby', icon: '✈️' },
  { name: 'Lecture', category: 'Hobby', icon: '📚' },
  { name: 'Cinéma', category: 'Hobby', icon: '🎬' },
  { name: 'Jeux Vidéo', category: 'Hobby', icon: '🎮' },
  { name: 'Photographie', category: 'Hobby', icon: '📸' },
  { name: 'Danse', category: 'Hobby', icon: '💃' },
  { name: 'Shopping', category: 'Hobby', icon: '🛍️' },
  { name: 'Art', category: 'Hobby', icon: '🎨' },
];

async function main() {
  console.log('🌱 Start seeding interests...');

  for (const interest of interests) {
    const existing = await prisma.interest.findUnique({
      where: { name: interest.name }
    });

    if (!existing) {
      await prisma.interest.create({
        data: interest,
      });
      console.log(`Created interest: ${interest.name}`);
    }
  }

  console.log('✅ Seeding finished.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
