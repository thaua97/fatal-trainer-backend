import type { FastifyInstance } from 'fastify'
import { makeListAvailablePromotionTemplatesUseCase } from '../../factories/make-use-cases'
import { requireTrainerSession } from '../../middlewares/session'

export async function promotionTemplatesRoutes(app: FastifyInstance) {
  app.get('/promotion-templates', async (request, reply) => {
    await requireTrainerSession(request)
    const useCase = makeListAvailablePromotionTemplatesUseCase()
    const items = await useCase.execute()
    return reply.send({ items })
  })
}
