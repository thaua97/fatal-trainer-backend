import { DEFAULT_LIST_QUERY } from '@/domain/catalog/enterprise/value-objects/list-query'
import type { PaginatedTrainersResult } from '@/domain/catalog/application/repositories/personal-trainers-repository'
import type { PersonalTrainersRepository } from '@/domain/catalog/application/repositories/personal-trainers-repository'
import type { FavoritesRepository } from '../repositories/favorites-repository'

export class ListFavoriteTrainersUseCase {
  constructor(
    private readonly favoritesRepository: FavoritesRepository,
    private readonly trainersRepository: PersonalTrainersRepository,
  ) {}

  async execute(
    userId: string | null,
    ids: string[],
    page = DEFAULT_LIST_QUERY.page,
    pageSize = DEFAULT_LIST_QUERY.pageSize,
  ): Promise<PaginatedTrainersResult> {
    const trainerIds = userId
      ? await this.favoritesRepository.listIds(userId)
      : [...new Set(ids)]

    const trainers = await this.trainersRepository.findByIds(trainerIds)
    const start = (page - 1) * pageSize
    const items = trainers.slice(start, start + pageSize)

    return {
      items,
      total: trainers.length,
      page,
      pageSize,
      hasMore: page * pageSize < trainers.length,
    }
  }
}

export class SyncFavoritesUseCase {
  constructor(private readonly favoritesRepository: FavoritesRepository) {}

  async execute(userId: string, trainerIds: string[]): Promise<number> {
    return this.favoritesRepository.sync(userId, trainerIds)
  }
}

export class AddFavoriteUseCase {
  constructor(private readonly favoritesRepository: FavoritesRepository) {}

  async execute(userId: string, trainerId: string): Promise<void> {
    await this.favoritesRepository.add(userId, trainerId)
  }
}

export class RemoveFavoriteUseCase {
  constructor(private readonly favoritesRepository: FavoritesRepository) {}

  async execute(userId: string, trainerId: string): Promise<void> {
    await this.favoritesRepository.remove(userId, trainerId)
  }
}
