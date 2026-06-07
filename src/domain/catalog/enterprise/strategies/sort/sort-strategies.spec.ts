import { describe, expect, it } from 'vitest'
import { sortTrainers, SortStrategyFactory } from './sort-strategies'
import { generateMockTrainers } from '@/utils/tests/factories/make-personal-trainer'
import { DEFAULT_LIST_QUERY } from '../../value-objects/list-query'

describe('sort strategies', () => {
  it('sorts by each strategy', () => {
    const trainers = generateMockTrainers(10)

    for (const sortBy of [
      'price',
      'rating',
      'distance',
      'name',
      'reviewCount',
      'experienceYears',
      'discount',
    ] as const) {
      const sorted = sortTrainers(trainers, { ...DEFAULT_LIST_QUERY, sortBy, sortOrder: 'asc' })
      expect(sorted.length).toBe(trainers.length)
      expect(SortStrategyFactory.create(sortBy)).toBeDefined()
    }
  })
})
