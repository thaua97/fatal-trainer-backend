import type {
  ReviewPayload,
  TrainerReviewItem,
  UpsertReviewResult,
} from '../../enterprise/entities/trainer-review'

export interface PaginatedReviewsResult {
  items: TrainerReviewItem[]
  total: number
  page: number
  pageSize: number
}

export interface ReviewsRepository {
  listByTrainer(trainerId: string, page: number, pageSize: number): Promise<PaginatedReviewsResult>
  findByTrainerAndUser(trainerId: string, userId: string): Promise<TrainerReviewItem | null>
  upsert(
    trainerId: string,
    userId: string,
    author: string,
    payload: ReviewPayload,
  ): Promise<UpsertReviewResult>
  recalculateTrainerAggregates(trainerId: string): Promise<{ rating: number | null; reviewCount: number }>
}
