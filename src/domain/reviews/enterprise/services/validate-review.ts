import type {
  ReviewPayload,
  ReviewValidationErrors,
  ReviewValidationResult,
} from '../entities/trainer-review'

const MIN_RATING = 0.5
const MAX_RATING = 5
const RATING_STEP = 0.5
const MIN_COMMENT_LENGTH = 10
const MAX_COMMENT_LENGTH = 500

export function isValidRatingStep(rating: number): boolean {
  if (rating < MIN_RATING || rating > MAX_RATING) {
    return false
  }

  return Number.isInteger(rating * 2)
}

export function validateReview(payload: ReviewPayload): ReviewValidationResult {
  const errors: ReviewValidationErrors = {}

  if (payload.rating == null || Number.isNaN(payload.rating)) {
    errors.rating = 'required'
  } else if (!isValidRatingStep(payload.rating)) {
    errors.rating = 'invalid'
  }

  const comment = payload.comment.trim()
  if (!comment) {
    errors.comment = 'required'
  } else if (comment.length < MIN_COMMENT_LENGTH) {
    errors.comment = 'tooShort'
  } else if (comment.length > MAX_COMMENT_LENGTH) {
    errors.comment = 'tooLong'
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  }
}
