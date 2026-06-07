import { describe, expect, it } from 'vitest'
import {
  computePromoPrice,
  getDiscountPercent,
  getDisplayPrice,
  isOnPromotion,
} from './trainer-pricing'
import { makePersonalTrainer } from '@/utils/tests/factories/make-personal-trainer'

describe('trainer-pricing', () => {
  it('computes promo price and discount', () => {
    expect(computePromoPrice(100, 20)).toBe(80)
    expect(getDiscountPercent(makePersonalTrainer(0))).toBeTypeOf('number')
  })

  it('detects active promotion', () => {
    const trainer = makePersonalTrainer(0)
    expect(typeof isOnPromotion(trainer)).toBe('boolean')
    expect(getDisplayPrice(trainer)).toBeGreaterThan(0)
  })
})
