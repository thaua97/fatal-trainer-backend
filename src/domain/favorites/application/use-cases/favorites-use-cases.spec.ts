import { describe, expect, it } from 'vitest'
import { generateMockTrainers } from '@/utils/tests/factories/make-personal-trainer'
import { InMemoryPersonalTrainersRepository } from '@/utils/tests/repositories/in-memory-personal-trainers-repository'
import { InMemoryFavoritesRepository } from '@/utils/tests/repositories/in-memory-favorites-repository'
import {
  AddFavoriteUseCase,
  ListFavoriteTrainersUseCase,
  SyncFavoritesUseCase,
} from './favorites-use-cases'

describe('Favorites use cases', () => {
  it('lists and syncs favorites', async () => {
    const trainersRepository = new InMemoryPersonalTrainersRepository()
    trainersRepository.items = generateMockTrainers(5)

    const favoritesRepository = new InMemoryFavoritesRepository()
    const userId = 'user-1'

    const add = new AddFavoriteUseCase(favoritesRepository)
    await add.execute(userId, trainersRepository.items[0]!.id)

    const list = new ListFavoriteTrainersUseCase(favoritesRepository, trainersRepository)
    const result = await list.execute(userId, [], 1, 10)
    expect(result.items).toHaveLength(1)

    const sync = new SyncFavoritesUseCase(favoritesRepository)
    const synced = await sync.execute(userId, [trainersRepository.items[1]!.id])
    expect(synced).toBe(1)
  })
})
