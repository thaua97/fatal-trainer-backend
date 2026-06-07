export interface FavoritesRepository {
  listIds(userId: string): Promise<string[]>
  add(userId: string, trainerId: string): Promise<void>
  remove(userId: string, trainerId: string): Promise<void>
  sync(userId: string, trainerIds: string[]): Promise<number>
}
