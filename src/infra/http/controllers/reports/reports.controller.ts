import type { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { makeCreateReportUseCase } from '../../factories/make-use-cases'
import { mapErrorToResponse } from '../../errors/map-error-to-response'

const reportSchema = z.object({
  type: z.string(),
  occurredAt: z.string(),
  trainerId: z.string(),
  description: z.string(),
  contactEmail: z.string(),
})

export async function reportsRoutes(app: FastifyInstance) {
  app.post('/reports', async (request, reply) => {
    try {
      const body = reportSchema.parse(request.body)
      const useCase = makeCreateReportUseCase()
      const result = await useCase.execute({
        type: body.type as 'inappropriate_content' | 'fake_profile' | 'harassment' | 'other',
        occurredAt: body.occurredAt,
        trainerId: body.trainerId,
        description: body.description,
        contactEmail: body.contactEmail,
      })

      return reply.status(201).send(result)
    } catch (error) {
      const mapped = mapErrorToResponse(error)
      return reply.status(mapped.statusCode).send(mapped.body)
    }
  })
}
