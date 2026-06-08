import { hash } from 'bcryptjs'
import type { PrismaClient } from '@prisma/client'
import type { TrainerReview } from '@/domain/catalog/enterprise/entities/personal-trainer'
import { SEED_PASSWORD } from './users'

const SEED_STUDENT_COUNT = 120

export async function seedReviewStudents(prisma: PrismaClient): Promise<string[]> {
  const passwordHash = await hash(SEED_PASSWORD, 10)
  const userIds: string[] = []

  for (let index = 0; index < SEED_STUDENT_COUNT; index += 1) {
    const created = await prisma.user.create({
      data: {
        name: `Aluno Seed ${index + 1}`,
        email: `aluno-seed-${String(index + 1).padStart(3, '0')}@fataltrainer.com`,
        password_hash: passwordHash,
        role: 'student',
      },
    })
    userIds.push(created.id)
  }

  return userIds
}

export async function seedTrainerReviewsFromJson(
  prisma: PrismaClient,
  studentUserIds: string[],
) {
  if (!studentUserIds.length) {
    return
  }

  const trainers = await prisma.personalTrainer.findMany({
    select: {
      id: true,
      reviews: true,
    },
  })

  let studentIndex = 0

  for (const trainer of trainers) {
    const embedded = (trainer.reviews as TrainerReview[] | null) ?? []
    if (!embedded.length) {
      continue
    }

    for (const review of embedded) {
      const userId = studentUserIds[studentIndex % studentUserIds.length]!
      studentIndex += 1

      await prisma.trainerReview.create({
        data: {
          trainer_id: trainer.id,
          user_id: userId,
          rating: review.rating,
          comment: review.comment,
        },
      })
    }

    const aggregate = await prisma.trainerReview.aggregate({
      where: { trainer_id: trainer.id },
      _avg: { rating: true },
      _count: { _all: true },
    })

    await prisma.personalTrainer.update({
      where: { id: trainer.id },
      data: {
        rating: aggregate._count._all > 0 ? aggregate._avg.rating : null,
        review_count: aggregate._count._all,
        reviews: null,
      },
    })
  }
}
