import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import pg from 'pg'
import { generateMockTrainers } from '../src/utils/tests/factories/make-personal-trainer'
import { mapTrainerToPrisma } from '../src/infra/database/prisma/mappers/prisma-mapper'
import { seedUsers } from './seeds/users'
import { seedReviewStudents, seedTrainerReviewsFromJson } from './seeds/reviews'
import { seedPromotionTemplates } from './seeds/promotion-templates'

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

  const batchSize = 50
  for (let i = 0; i < trainers.length; i += batchSize) {
    const batch = trainers.slice(i, i + batchSize)
    await prisma.personalTrainer.createMany({
      data: batch.map(mapTrainerToPrisma),
    })
  }

  const studentUserIds = await seedReviewStudents(prisma)
  await seedTrainerReviewsFromJson(prisma, studentUserIds)

  console.log(`Seeded ${trainers.length} personal trainers (${SEED_TRAINER_COUNT} catalog + linked profiles)`)
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
