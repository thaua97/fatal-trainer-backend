import type { FastifyInstance } from 'fastify'
import { z } from 'zod'
import {
  makeGetMyTrainerReviewUseCase,
  makeGetPersonalTrainerByIdUseCase,
  makeListTrainerReviewsUseCase,
  makeUpsertTrainerReviewUseCase,
} from '../../factories/make-use-cases'
import { requireSession } from '../../middlewares/session'

const reviewBodySchema = z.object({
  rating: z.number(),
  comment: z.string(),
})

export async function trainerReviewsRoutes(app: FastifyInstance) {
  app.get('/personal-trainers/:trainerId/reviews', async (request, reply) => {
    const { trainerId } = request.params as { trainerId: string }
    const query = request.query as { page?: string; pageSize?: string }
    const page = Number(query.page) > 0 ? Number(query.page) : 1
    const pageSize = Number(query.pageSize) > 0 ? Number(query.pageSize) : 10

    const trainerUseCase = makeGetPersonalTrainerByIdUseCase()
    await trainerUseCase.execute(trainerId)

    const useCase = makeListTrainerReviewsUseCase()
    const result = await useCase.execute(trainerId, page, pageSize)

    return reply.send(result)
  })

  app.get('/personal-trainers/:trainerId/reviews/mine', async (request, reply) => {
    const user = await requireSession(request)
    const { trainerId } = request.params as { trainerId: string }

    const trainerUseCase = makeGetPersonalTrainerByIdUseCase()
    await trainerUseCase.execute(trainerId)

    const useCase = makeGetMyTrainerReviewUseCase()
    const review = await useCase.execute(trainerId, user.id)

    return reply.send({ review })
  })

  app.post('/personal-trainers/:trainerId/reviews', async (request, reply) => {
    const user = await requireSession(request)
    const { trainerId } = request.params as { trainerId: string }
    const body = reviewBodySchema.parse(request.body)

    const useCase = makeUpsertTrainerReviewUseCase()
    const result = await useCase.execute(trainerId, user.id, user.name, body)

    return reply.status(result.created ? 201 : 200).send(result)
  })
}
