import type { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { ResourceNotFoundError } from '@/domain/shared/errors/domain-errors'
import {
  makeGetMyTrainerReviewUseCase,
  makeGetPersonalTrainerByIdUseCase,
  makeListTrainerReviewsUseCase,
  makeUpsertTrainerReviewUseCase,
} from '../../factories/make-use-cases'
import { mapErrorToResponse } from '../../errors/map-error-to-response'
import { requireSession } from '../../middlewares/session'

const reviewBodySchema = z.object({
  rating: z.number(),
  comment: z.string(),
})

export async function trainerReviewsRoutes(app: FastifyInstance) {
  app.get('/personal-trainers/:trainerId/reviews', async (request, reply) => {
    try {
      const { trainerId } = request.params as { trainerId: string }
      const query = request.query as { page?: string; pageSize?: string }
      const page = Number(query.page) > 0 ? Number(query.page) : 1
      const pageSize = Number(query.pageSize) > 0 ? Number(query.pageSize) : 10

      const trainerUseCase = makeGetPersonalTrainerByIdUseCase()
      const trainer = await trainerUseCase.execute(trainerId)
      if (!trainer) {
        throw new ResourceNotFoundError('Trainer not found')
      }

      const useCase = makeListTrainerReviewsUseCase()
      const result = await useCase.execute(trainerId, page, pageSize)

      return reply.send(result)
    } catch (error) {
      const mapped = mapErrorToResponse(error)
      return reply.status(mapped.statusCode).send(mapped.body)
    }
  })

  app.get('/personal-trainers/:trainerId/reviews/mine', async (request, reply) => {
    try {
      const user = await requireSession(request)
      const { trainerId } = request.params as { trainerId: string }

      const trainerUseCase = makeGetPersonalTrainerByIdUseCase()
      const trainer = await trainerUseCase.execute(trainerId)
      if (!trainer) {
        throw new ResourceNotFoundError('Trainer not found')
      }

      const useCase = makeGetMyTrainerReviewUseCase()
      const review = await useCase.execute(trainerId, user.id)

      return reply.send({ review })
    } catch (error) {
      const mapped = mapErrorToResponse(error)
      return reply.status(mapped.statusCode).send(mapped.body)
    }
  })

  app.post('/personal-trainers/:trainerId/reviews', async (request, reply) => {
    try {
      const user = await requireSession(request)
      const { trainerId } = request.params as { trainerId: string }
      const body = reviewBodySchema.parse(request.body)

      const useCase = makeUpsertTrainerReviewUseCase()
      const result = await useCase.execute(trainerId, user.id, user.name, body)

      return reply.status(result.created ? 201 : 200).send(result)
    } catch (error) {
      const mapped = mapErrorToResponse(error)
      return reply.status(mapped.statusCode).send(mapped.body)
    }
  })
}
