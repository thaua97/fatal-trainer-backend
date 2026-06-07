import { describe, expect, it } from 'vitest'
import {
  computeDiscountPercent,
  computePromoPrice,
  convertPriceForView,
  getDisplayPromoPrice,
  getDisplayServicePrice,
  getEffectivePrice,
  isOnPromotion,
} from './trainer-pricing'
import { makePersonalTrainer } from '@/utils/tests/factories/make-personal-trainer'
import { PersonalTrainer } from '../entities/personal-trainer'

describe('trainer-pricing edge cases', () => {
  it('handles pricing helpers', () => {
    expect(computePromoPrice(100, 20)).toBe(80)
    expect(computeDiscountPercent(0, 10)).toBeNull()
    expect(convertPriceForView(100, 'monthly')).toBe(800)
    expect(getDisplayServicePrice(makePersonalTrainer(0), 'monthly')).toBeGreaterThan(0)

    const trainer = makePersonalTrainer(0)
    expect(getEffectivePrice(trainer)).toBeGreaterThan(0)
    expect(typeof isOnPromotion(trainer)).toBe('boolean')
    expect(getDisplayPromoPrice(trainer)).toBeDefined()
  })

  it('returns undefined promo when inactive', () => {
    const trainer = PersonalTrainer.create({
      name: 'Test',
      profession: 'Personal',
      description: 'Descrição longa o suficiente para testes unitários.',
      photoUrl: 'https://example.com/a.jpg',
      servicePrice: 100,
      promotion: {
        promoPrice: 80,
        startsAt: '2099-01-01',
        endsAt: '2099-12-31',
      },
    })

    expect(getDisplayPromoPrice(trainer)).toBeUndefined()
  })
})
