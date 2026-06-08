import { describe, expect, it } from 'vitest'
import { validateReview, isValidRatingStep } from './validate-review'

describe('validateReview', () => {
  it('accepts valid rating and comment', () => {
    const result = validateReview({ rating: 4.5, comment: 'Excelente profissional!' })
    expect(result.valid).toBe(true)
  })

  it('rejects invalid rating step', () => {
    const result = validateReview({ rating: 4.3, comment: 'Comentário válido aqui' })
    expect(result.valid).toBe(false)
    expect(result.errors.rating).toBe('invalid')
  })

  it('rejects short comment', () => {
    const result = validateReview({ rating: 5, comment: 'Curto' })
    expect(result.valid).toBe(false)
    expect(result.errors.comment).toBe('tooShort')
  })

  it('validates rating bounds', () => {
    expect(isValidRatingStep(0.5)).toBe(true)
    expect(isValidRatingStep(5)).toBe(true)
    expect(isValidRatingStep(0)).toBe(false)
    expect(isValidRatingStep(5.5)).toBe(false)
  })
})
