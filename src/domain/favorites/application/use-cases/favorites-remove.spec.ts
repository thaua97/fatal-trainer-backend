import { describe, expect, it } from 'vitest'
import { generateMockTrainers } from '@/utils/tests/factories/make-personal-trainer'
import { InMemoryPersonalTrainersRepository } from '@/utils/tests/repositories/in-memory-personal-trainers-repository'
import { InMemoryFavoritesRepository } from '@/utils/tests/repositories/in-memory-favorites-repository'
import { RemoveFavoriteUseCase } from './favorites-use-cases'

describe('RemoveFavoriteUseCase', () => {
  it('removes favorite trainer', async () => {
    const favorites = new InMemoryFavoritesRepository()
    const trainers = new InMemoryPersonalTrainersRepository()
    trainers.items = generateMockTrainers(2)

    await favorites.add('user-1', trainers.items[0]!.id)
    const sut = new RemoveFavoriteUseCase(favorites)
    await sut.execute('user-1', trainers.items[0]!.id)

    expect(await favorites.listIds('user-1')).toHaveLength(0)
  })
})
