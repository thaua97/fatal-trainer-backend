import type { ReviewsRepository } from '../repositories/reviews-repository'

export class GetMyTrainerReviewUseCase {
  constructor(private readonly reviewsRepository: ReviewsRepository) {}

  execute(trainerId: string, userId: string) {
    return this.reviewsRepository.findByTrainerAndUser(trainerId, userId)
  }
}
