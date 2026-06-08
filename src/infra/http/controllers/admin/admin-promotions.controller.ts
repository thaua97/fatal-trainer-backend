import type { FastifyInstance } from 'fastify'
import {
  makeCreatePromotionTemplateUseCase,
  makeDeletePromotionTemplateUseCase,
  makeGetPromotionTemplateUseCase,
  makeListPromotionTemplatesUseCase,
  makeUpdatePromotionTemplateUseCase,
} from '../../factories/make-use-cases'
import { requireAdminSession } from '../../middlewares/session'
import {
  createPromotionSchema,
  listPromotionsSchema,
  updatePromotionSchema,
} from './schemas/admin-schemas'

export async function adminPromotionsRoutes(app: FastifyInstance) {
  app.get('/admin/promotions', async (request, reply) => {
    await requireAdminSession(request)
    const query = listPromotionsSchema.parse(request.query)
    const useCase = makeListPromotionTemplatesUseCase()
    const result = await useCase.execute(query)
    return reply.send(result)
  })

  app.post('/admin/promotions', async (request, reply) => {
    await requireAdminSession(request)
    const body = createPromotionSchema.parse(request.body)
    const useCase = makeCreatePromotionTemplateUseCase()
    const promotion = await useCase.execute(body)
    return reply.status(201).send({ promotion })
  })

  app.get('/admin/promotions/:id', async (request, reply) => {
    await requireAdminSession(request)
    const { id } = request.params as { id: string }
    const useCase = makeGetPromotionTemplateUseCase()
    const promotion = await useCase.execute(id)
    return reply.send({ promotion })
  })

  app.patch('/admin/promotions/:id', async (request, reply) => {
    await requireAdminSession(request)
    const { id } = request.params as { id: string }
    const body = updatePromotionSchema.parse(request.body)
    const useCase = makeUpdatePromotionTemplateUseCase()
    const promotion = await useCase.execute(id, body)
    return reply.send({ promotion })
  })

  app.delete('/admin/promotions/:id', async (request, reply) => {
    await requireAdminSession(request)
    const { id } = request.params as { id: string }
    const useCase = makeDeletePromotionTemplateUseCase()
    await useCase.execute(id)
    return reply.status(204).send()
  })
}
