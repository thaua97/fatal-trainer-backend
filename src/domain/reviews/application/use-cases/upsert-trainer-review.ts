import { ForbiddenError, ResourceNotFoundError, ValidationError } from '@/domain/shared/errors/domain-errors'
import type { PersonalTrainersRepository } from '@/domain/catalog/application/repositories/personal-trainers-repository'
import type { ReviewPayload } from '../../enterprise/entities/trainer-review'
import { validateReview } from '../../enterprise/services/validate-review'
import type { ReviewsRepository } from '../repositories/reviews-repository'

export class UpsertTrainerReviewUseCase {
  constructor(
    private readonly reviewsRepository: ReviewsRepository,
    private readonly trainersRepository: PersonalTrainersRepository,
  ) {}

  async execute(trainerId: string, userId: string, author: string, payload: ReviewPayload) {
    const trainer = await this.trainersRepository.findById(trainerId)
    if (!trainer) {
      throw new ResourceNotFoundError('Trainer not found')
    }

    if (trainer.props.userId === userId) {
      throw new ForbiddenError('You cannot review your own profile')
    }

    const validation = validateReview(payload)
    if (!validation.valid) {
      throw new ValidationError(validation.errors)
    }

    const result = await this.reviewsRepository.upsert(trainerId, userId, author, {
      rating: payload.rating,
      comment: payload.comment.trim(),
    })

    await this.reviewsRepository.recalculateTrainerAggregates(trainerId)

    return result
  }
}
