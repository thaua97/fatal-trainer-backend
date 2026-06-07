import { describe, expect, it } from 'vitest'
import { generateMockTrainers } from '@/utils/tests/factories/make-personal-trainer'
import { InMemoryPersonalTrainersRepository } from '@/utils/tests/repositories/in-memory-personal-trainers-repository'
import { ListPersonalTrainersUseCase } from './list-personal-trainers'
import { DEFAULT_LIST_QUERY } from '../../enterprise/value-objects/list-query'

describe('ListPersonalTrainersUseCase', () => {
  it('returns paginated trainers with filters', async () => {
    const repository = new InMemoryPersonalTrainersRepository()
    repository.items = generateMockTrainers(30)

    const sut = new ListPersonalTrainersUseCase(repository)
    const result = await sut.execute({
      ...DEFAULT_LIST_QUERY,
      page: 1,
      pageSize: 10,
      search: 'Ana',
    })

    expect(result.items.length).toBeLessThanOrEqual(10)
    expect(result.page).toBe(1)
    expect(result.hasMore).toBe(result.page * result.pageSize < result.total)
  })

  it('applies price and rating filters', async () => {
    const repository = new InMemoryPersonalTrainersRepository()
    repository.items = generateMockTrainers(20)

    const sut = new ListPersonalTrainersUseCase(repository)
    const result = await sut.execute({
      ...DEFAULT_LIST_QUERY,
      minPrice: 100,
      minRating: 4,
      maxDistanceKm: 10,
    })

    expect(result.items.every((trainer) => (trainer.props.rating ?? 0) >= 4)).toBe(true)
  })
})
