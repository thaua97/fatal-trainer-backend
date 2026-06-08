import { hash } from 'bcryptjs'
import type { PrismaClient } from '@prisma/client'
import type { PersonalTrainer } from '../../src/domain/catalog/enterprise/entities/personal-trainer'
import { mapTrainerToPrisma } from '../../src/infra/database/prisma/mappers/prisma-mapper'
import { SEED_PASSWORD } from './users'

const BATCH_SIZE = 50

function trainerUserEmail(index: number): string {
  return `personal-seed-${String(index + 1).padStart(3, '0')}@fataltrainer.com`
}

export async function seedTrainerCatalogWithUsers(
  prisma: PrismaClient,
  trainers: PersonalTrainer[],
) {
  const passwordHash = await hash(SEED_PASSWORD, 10)

  for (let offset = 0; offset < trainers.length; offset += BATCH_SIZE) {
    const batch = trainers.slice(offset, offset + BATCH_SIZE)

    const users = await prisma.user.createManyAndReturn({
      data: batch.map((trainer, batchIndex) => {
        const index = offset + batchIndex

        return {
          name: trainer.props.name,
          email: trainerUserEmail(index),
          password_hash: passwordHash,
          role: 'personal_trainer' as const,
          phone_number: trainer.props.contactPhone ?? null,
          avatar_url: trainer.props.photoUrl,
          city: trainer.props.city ?? null,
          state: trainer.props.state ?? null,
        }
      }),
    })

    await prisma.personalTrainer.createMany({
      data: batch.map((trainer, batchIndex) => ({
        ...mapTrainerToPrisma(trainer),
        user_id: users[batchIndex]!.id,
      })),
    })
  }

  console.log(`Seeded ${trainers.length} catalog trainers with linked user accounts`)
}
