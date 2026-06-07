import { describe, expect, it } from 'vitest'
import { generateMockTrainers } from '@/utils/tests/factories/make-personal-trainer'
import { DEFAULT_LIST_QUERY } from '../../value-objects/list-query'
import {
  CityFilterStrategy,
  MaxDistanceFilterStrategy,
  MinRatingFilterStrategy,
  ModalitiesFilterStrategy,
  PriceRangeFilterStrategy,
  PromotionFilterStrategy,
  SearchFilterStrategy,
  SpecialtiesFilterStrategy,
} from './filter-strategies'

describe('filter strategies', () => {
  const trainer = generateMockTrainers(1)[0]!

  it('matches search, specialties and modalities', () => {
    expect(new SearchFilterStrategy().matches(trainer, { ...DEFAULT_LIST_QUERY, search: 'Ana' })).toBe(true)
    expect(new SpecialtiesFilterStrategy().matches(trainer, { ...DEFAULT_LIST_QUERY, specialties: ['Musculação'] })).toBe(true)
    expect(new ModalitiesFilterStrategy().matches(trainer, { ...DEFAULT_LIST_QUERY, modalities: ['presencial'] })).toBe(true)
    expect(new CityFilterStrategy().matches(trainer, { ...DEFAULT_LIST_QUERY, city: trainer.props.city })).toBe(true)
  })

  it('matches price, rating, distance and promotion', () => {
    expect(new PriceRangeFilterStrategy().matches(trainer, { ...DEFAULT_LIST_QUERY, minPrice: 1, maxPrice: 9999 })).toBe(true)
    expect(new MinRatingFilterStrategy().matches(trainer, { ...DEFAULT_LIST_QUERY, minRating: 1 })).toBe(true)
    expect(new MaxDistanceFilterStrategy().matches(trainer, { ...DEFAULT_LIST_QUERY, maxDistanceKm: 999 })).toBe(true)
    expect(new PromotionFilterStrategy().matches(trainer, { ...DEFAULT_LIST_QUERY, onPromotion: false })).toBe(true)
    expect(new PromotionFilterStrategy().matches(trainer, { ...DEFAULT_LIST_QUERY, onPromotion: true })).toBeTypeOf('boolean')
    expect(new MaxDistanceFilterStrategy().matches(trainer, { ...DEFAULT_LIST_QUERY, maxDistanceKm: 0.1 })).toBe(false)
  })
})
