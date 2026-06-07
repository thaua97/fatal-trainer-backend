import { prisma } from '@/libs/prisma'
import type { FavoritesRepository } from '@/domain/favorites/application/repositories/favorites-repository'

export class PrismaFavoritesRepository implements FavoritesRepository {
  async listIds(userId: string): Promise<string[]> {
    const favorites = await prisma.favorite.findMany({
      where: { user_id: userId },
      select: { trainer_id: true },
    })

    return favorites.map((favorite) => favorite.trainer_id)
  }

  async add(userId: string, trainerId: string): Promise<void> {
    await prisma.favorite.upsert({
      where: {
        user_id_trainer_id: {
          user_id: userId,
          trainer_id: trainerId,
        },
      },
      create: { user_id: userId, trainer_id: trainerId },
      update: {},
    })
  }

  async remove(userId: string, trainerId: string): Promise<void> {
    await prisma.favorite.deleteMany({
      where: { user_id: userId, trainer_id: trainerId },
    })
  }

  async sync(userId: string, trainerIds: string[]): Promise<number> {
    const uniqueIds = [...new Set(trainerIds)]

    await prisma.favorite.deleteMany({ where: { user_id: userId } })

    if (uniqueIds.length) {
      await prisma.favorite.createMany({
        data: uniqueIds.map((trainerId) => ({
          user_id: userId,
          trainer_id: trainerId,
        })),
        skipDuplicates: true,
      })
    }

    return uniqueIds.length
  }
}
