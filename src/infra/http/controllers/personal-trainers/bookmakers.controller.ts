import type { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { DEFAULT_LIST_QUERY } from '@/domain/catalog/enterprise/value-objects/list-query'
import {
  makeAddFavoriteUseCase,
  makeListFavoriteTrainersUseCase,
  makeRemoveFavoriteUseCase,
  makeSyncFavoritesUseCase,
} from '../../factories/make-use-cases'
import { mapErrorToResponse } from '../../errors/map-error-to-response'
import { presentPaginatedTrainers } from '../../presenters/trainer-presenter'
import { requireSession, resolveSession } from '../../middlewares/session'

function parseIds(value: string | string[] | undefined): string[] {
  if (!value) return []
  if (Array.isArray(value)) {
    return value.flatMap((entry) => entry.split(',')).filter(Boolean)
  }
  return value.split(',').filter(Boolean)
}

export async function bookmakersRoutes(app: FastifyInstance) {
  app.get('/personal-trainers/bookmakers', async (request, reply) => {
    try {
      const query = request.query as { page?: string; pageSize?: string; ids?: string | string[] }
      const page = Number(query.page) > 0 ? Number(query.page) : DEFAULT_LIST_QUERY.page
      const pageSize =
        Number(query.pageSize) > 0 ? Number(query.pageSize) : DEFAULT_LIST_QUERY.pageSize

      const user = await resolveSession(request)
      const useCase = makeListFavoriteTrainersUseCase()
      const result = await useCase.execute(
        user?.id ?? null,
        parseIds(query.ids),
        page,
        pageSize,
      )

      return reply.send(presentPaginatedTrainers(result))
    } catch (error) {
      const mapped = mapErrorToResponse(error)
      return reply.status(mapped.statusCode).send(mapped.body)
    }
  })

  app.post('/personal-trainers/bookmakers', async (request, reply) => {
    try {
      const user = await requireSession(request)
      const body = z.object({ trainerIds: z.array(z.string()) }).parse(request.body)
      const useCase = makeSyncFavoritesUseCase()
      const synced = await useCase.execute(user.id, body.trainerIds)
      return reply.send({ synced })
    } catch (error) {
      const mapped = mapErrorToResponse(error)
      return reply.status(mapped.statusCode).send(mapped.body)
    }
  })

  app.post('/personal-trainers/bookmakers/:id', async (request, reply) => {
    try {
      const user = await requireSession(request)
      const { id } = request.params as { id: string }
      const useCase = makeAddFavoriteUseCase()
      await useCase.execute(user.id, id)
      return reply.status(201).send()
    } catch (error) {
      const mapped = mapErrorToResponse(error)
      return reply.status(mapped.statusCode).send(mapped.body)
    }
  })

  app.delete('/personal-trainers/bookmakers/:id', async (request, reply) => {
    try {
      const user = await requireSession(request)
      const { id } = request.params as { id: string }
      const useCase = makeRemoveFavoriteUseCase()
      await useCase.execute(user.id, id)
      return reply.status(204).send()
    } catch (error) {
      const mapped = mapErrorToResponse(error)
      return reply.status(mapped.statusCode).send(mapped.body)
    }
  })
}
