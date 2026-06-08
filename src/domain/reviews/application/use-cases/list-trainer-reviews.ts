import type { ReviewsRepository } from '../repositories/reviews-repository'

export class ListTrainerReviewsUseCase {
  constructor(private readonly reviewsRepository: ReviewsRepository) {}

  execute(trainerId: string, page: number, pageSize: number) {
    const safePage = page > 0 ? page : 1
    const safePageSize = pageSize > 0 ? Math.min(pageSize, 50) : 10

    return this.reviewsRepository.listByTrainer(trainerId, safePage, safePageSize)
  }
}
