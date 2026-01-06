import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';
import dotenv from 'dotenv';
import bcrypt from 'bcrypt';

dotenv.config();

const connectionString = `${process.env.DATABASE_URL}`;
const pool = new pg.Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🌱 Start seeding dummy users...');

  // 1. Get interests to link them
  const allInterests = await prisma.interest.findMany();
  const interestMap = new Map(allInterests.map(i => [i.name, i.id]));

  const usersData = [
    {
      username: 'aisha_dk',
      email: 'aisha@example.com',
      gender: 'female',
      bio: 'Adore le yoga au lever du soleil et les voyages improvisés. À la recherche de bonnes ondes ✨',
      location: 'Dakar, Plateau',
      birthDate: new Date('2001-05-15'),
      interests: ['Yoga', 'Voyage', 'Café', 'Art']
    },
    {
      username: 'moussa_lion',
      email: 'moussa@example.com',
      gender: 'male',
      bio: 'Fan inconditionnel des Lions de la Teranga 🇸🇳. Sport, Hip Hop et Chill.',
      location: 'Dakar, Almadies',
      birthDate: new Date('1997-11-20'),
      interests: ['Football', 'Hip Hop', 'Pizza', 'Musculation']
    },
    {
      username: 'fatou_dance',
      email: 'fatou@example.com',
      gender: 'female',
      bio: 'La danse c’est ma vie ! Toujours partante pour un bon Mbalax ou de l’Afrobeats. 💃',
      location: 'Guediawaye',
      birthDate: new Date('2003-08-10'),
      interests: ['Danse', 'Afrobeats', 'Mbalax', 'Cuisine']
    },
    {
      username: 'baye_tech',
      email: 'baye@example.com',
      gender: 'male',
      bio: 'Entrepreneur, passionné par la tech et la rando. On va grimper ensemble ? ⛰️',
      location: 'Mermoz',
      birthDate: new Date('1994-03-25'),
      interests: ['Randonnée', 'Running', 'Lecture', 'Café']
    },
    {
      username: 'ami_brunch',
      email: 'ami@example.com',
      gender: 'female',
      bio: 'Photographe à mes heures perdues. J’aime capturer l’instant présent et un bon brunch le dimanche.',
      location: 'Ngor',
      birthDate: new Date('1999-12-05'),
      interests: ['Photographie', 'Brunch', 'Art', 'Cinéma']
    }
  ];

  const passwordHash = await bcrypt.hash('SamaLink2026!', 10);

  for (const u of usersData) {
    const existing = await prisma.user.findUnique({
      where: { username: u.username }
    });

    if (!existing) {
      const newUser = await prisma.user.create({
        data: {
          username: u.username,
          email: u.email,
          passwordHash,
          gender: u.gender,
          bio: u.bio,
          location: u.location,
          birthDate: u.birthDate,
          isVerified: Math.random() > 0.5,
          verificationStatus: 'VERIFIED',
          avatarUrl: `https://i.pravatar.cc/300?u=${u.username}`
        }
      });

      // Link interests
      for (const iName of u.interests) {
        const interestId = interestMap.get(iName);
        if (interestId) {
          await prisma.userInterest.create({
            data: {
              userId: newUser.id,
              interestId: interestId
            }
          });
        }
      }
      console.log(`Created user: ${u.username}`);
    }
  }

  console.log('✅ Dummy users seeding finished.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
