import { describe, expect, it } from 'vitest'
import { FilterPipeline } from './filter-pipeline'
import { generateMockTrainers } from '@/utils/tests/factories/make-personal-trainer'
import { DEFAULT_LIST_QUERY } from '../../value-objects/list-query'

describe('FilterPipeline', () => {
  it('filters trainers by search and city', () => {
    const trainers = generateMockTrainers(20)
    const pipeline = new FilterPipeline()

    const result = pipeline.apply(trainers, {
      ...DEFAULT_LIST_QUERY,
      search: 'Ana',
      city: trainers[0]?.props.city,
    })

    expect(result.length).toBeGreaterThan(0)
  })
})
