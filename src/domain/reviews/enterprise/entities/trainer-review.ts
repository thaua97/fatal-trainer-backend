export interface ReviewPayload {
  rating: number
  comment: string
}

export type ReviewField = keyof ReviewPayload

export type ReviewValidationErrors = Partial<Record<ReviewField, string>>

export interface ReviewValidationResult {
  valid: boolean
  errors: ReviewValidationErrors
}

export interface TrainerReviewItem {
  id: string
  author: string
  rating: number
  comment: string
  createdAt: string
  updatedAt: string
}

export interface UpsertReviewResult {
  review: TrainerReviewItem
  created: boolean
}
