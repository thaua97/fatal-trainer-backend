import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import pg from 'pg'
import { generateMockTrainers } from '../src/utils/tests/factories/make-personal-trainer'
import { seedUsers } from './seeds/users'
import { seedReviewStudents, seedTrainerReviewsFromJson } from './seeds/reviews'
import { seedPromotionTemplates } from './seeds/promotion-templates'
import { seedTrainerCatalogWithUsers } from './seeds/trainer-catalog'

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

const SEED_TRAINER_COUNT = 500

async function main() {
  const trainers = generateMockTrainers(SEED_TRAINER_COUNT)

  await prisma.trainerReview.deleteMany()
  await prisma.report.deleteMany()
  await prisma.favorite.deleteMany()
  await prisma.session.deleteMany()
  await prisma.personalTrainer.deleteMany()
  await prisma.user.deleteMany()

  await seedUsers(prisma)
  await seedPromotionTemplates(prisma)

  await seedTrainerCatalogWithUsers(prisma, trainers)

  const studentUserIds = await seedReviewStudents(prisma)
  await seedTrainerReviewsFromJson(prisma, studentUserIds)

  console.log(`Seed complete: ${SEED_TRAINER_COUNT} catalog trainers + demo accounts (admin/students/personals)`)
}

main()
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
    await pool.end()
  })
