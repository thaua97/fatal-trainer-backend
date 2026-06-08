import type { FastifyInstance } from 'fastify'
import {
  makeDeactivateTrainerFromReportUseCase,
  makeListAdminReportsUseCase,
  makeUpdateReportStatusUseCase,
} from '../../factories/make-use-cases'
import { requireAdminSession } from '../../middlewares/session'
import { listReportsSchema, updateReportSchema } from './schemas/admin-schemas'

export async function adminReportsRoutes(app: FastifyInstance) {
  app.get('/admin/reports', async (request, reply) => {
    await requireAdminSession(request)
    const query = listReportsSchema.parse(request.query)
    const useCase = makeListAdminReportsUseCase()
    const result = await useCase.execute(query)
    return reply.send(result)
  })

  app.patch('/admin/reports/:id', async (request, reply) => {
    const admin = await requireAdminSession(request)
    const { id } = request.params as { id: string }
    const body = updateReportSchema.parse(request.body)
    const useCase = makeUpdateReportStatusUseCase()
    const report = await useCase.execute(id, body.status, admin.id)
    return reply.send({ report })
  })

  app.post('/admin/reports/:id/deactivate-trainer', async (request, reply) => {
    const admin = await requireAdminSession(request)
    const { id } = request.params as { id: string }
    const useCase = makeDeactivateTrainerFromReportUseCase()
    const report = await useCase.execute(id, admin.id)
    return reply.send({ report })
  })
}
