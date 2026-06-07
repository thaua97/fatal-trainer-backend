import type { FavoritesRepository } from '@/domain/favorites/application/repositories/favorites-repository'

export class InMemoryFavoritesRepository implements FavoritesRepository {
  public favorites = new Map<string, Set<string>>()

  async listIds(userId: string): Promise<string[]> {
    return [...(this.favorites.get(userId) ?? [])]
  }

  async add(userId: string, trainerId: string): Promise<void> {
    const current = this.favorites.get(userId) ?? new Set<string>()
    current.add(trainerId)
    this.favorites.set(userId, current)
  }

  async remove(userId: string, trainerId: string): Promise<void> {
    this.favorites.get(userId)?.delete(trainerId)
  }

  async sync(userId: string, trainerIds: string[]): Promise<number> {
    const uniqueIds = [...new Set(trainerIds)]
    this.favorites.set(userId, new Set(uniqueIds))
    return uniqueIds.length
  }
}
