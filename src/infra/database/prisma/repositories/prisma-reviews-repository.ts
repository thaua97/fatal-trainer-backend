import { prisma } from '@/libs/prisma'
import type { ReviewPayload } from '@/domain/reviews/enterprise/entities/trainer-review'
import type {
  PaginatedReviewsResult,
  ReviewsRepository,
} from '@/domain/reviews/application/repositories/reviews-repository'
import type { TrainerReviewItem } from '@/domain/reviews/enterprise/entities/trainer-review'

function mapReview(record: {
  id: string
  rating: number
  comment: string
  created_at: Date
  updated_at: Date
  user: { name: string }
}): TrainerReviewItem {
  return {
    id: record.id,
    author: record.user.name,
    rating: record.rating,
    comment: record.comment,
    createdAt: record.created_at.toISOString(),
    updatedAt: record.updated_at.toISOString(),
  }
}

export class PrismaReviewsRepository implements ReviewsRepository {
  async listByTrainer(
    trainerId: string,
    page: number,
    pageSize: number,
  ): Promise<PaginatedReviewsResult> {
    const skip = (page - 1) * pageSize

    const [records, total] = await Promise.all([
      prisma.trainerReview.findMany({
        where: { trainer_id: trainerId },
        include: { user: { select: { name: true } } },
        orderBy: { created_at: 'desc' },
        skip,
        take: pageSize,
      }),
      prisma.trainerReview.count({ where: { trainer_id: trainerId } }),
    ])

    return {
      items: records.map(mapReview),
      total,
      page,
      pageSize,
    }
  }

  async findByTrainerAndUser(
    trainerId: string,
    userId: string,
  ): Promise<TrainerReviewItem | null> {
    const record = await prisma.trainerReview.findUnique({
      where: {
        trainer_id_user_id: {
          trainer_id: trainerId,
          user_id: userId,
        },
      },
      include: { user: { select: { name: true } } },
    })

    return record ? mapReview(record) : null
  }

  async upsert(
    trainerId: string,
    userId: string,
    author: string,
    payload: ReviewPayload,
  ) {
    const existing = await prisma.trainerReview.findUnique({
      where: {
        trainer_id_user_id: {
          trainer_id: trainerId,
          user_id: userId,
        },
      },
      include: { user: { select: { name: true } } },
    })

    if (existing) {
      const updated = await prisma.trainerReview.update({
        where: { id: existing.id },
        data: {
          rating: payload.rating,
          comment: payload.comment,
        },
        include: { user: { select: { name: true } } },
      })

      return {
        review: mapReview(updated),
        created: false,
      }
    }

    const created = await prisma.trainerReview.create({
      data: {
        trainer_id: trainerId,
        user_id: userId,
        rating: payload.rating,
        comment: payload.comment,
      },
      include: { user: { select: { name: true } } },
    })

    return {
      review: mapReview(created),
      created: true,
    }
  }

  async recalculateTrainerAggregates(trainerId: string) {
    const aggregate = await prisma.trainerReview.aggregate({
      where: { trainer_id: trainerId },
      _avg: { rating: true },
      _count: { _all: true },
    })

    const reviewCount = aggregate._count._all
    const rating = reviewCount > 0 ? aggregate._avg.rating : null

    await prisma.personalTrainer.update({
      where: { id: trainerId },
      data: {
        rating,
        review_count: reviewCount,
        reviews: null,
      },
    })

    return {
      rating,
      reviewCount,
    }
  }
}
