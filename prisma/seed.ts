import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import pg from 'pg'
import { generateMockTrainers } from '../src/utils/tests/factories/make-personal-trainer'
import { mapTrainerToPrisma } from '../src/infra/database/prisma/mappers/prisma-mapper'
import { seedUsers } from './seeds/users'

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

async function main() {
  const trainers = generateMockTrainers(500)

  await prisma.report.deleteMany()
  await prisma.favorite.deleteMany()
  await prisma.session.deleteMany()
  await prisma.personalTrainer.deleteMany()
  await prisma.user.deleteMany()

  await seedUsers(prisma)

  const batchSize = 50
  for (let i = 0; i < trainers.length; i += batchSize) {
    const batch = trainers.slice(i, i + batchSize)
    await prisma.personalTrainer.createMany({
      data: batch.map(mapTrainerToPrisma),
    })
  }

  console.log(`Seeded ${trainers.length} personal trainers`)
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
