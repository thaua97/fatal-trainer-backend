import type { FastifyInstance } from 'fastify'
import { parseListQuery } from '@/domain/catalog/enterprise/value-objects/list-query'
import {
  makeGetPersonalTrainerByIdUseCase,
  makeListFeaturedTrainersUseCase,
  makeListPersonalTrainersUseCase,
} from '../../factories/make-use-cases'
import { mapErrorToResponse } from '../../errors/map-error-to-response'
import {
  presentFeaturedTrainers,
  presentPaginatedTrainers,
  presentTrainerDetail,
} from '../../presenters/trainer-presenter'

export async function personalTrainersRoutes(app: FastifyInstance) {
  app.get('/personal-trainers', async (request, reply) => {
    try {
      const query = parseListQuery(request.query as Record<string, string | string[] | undefined>)
      const useCase = makeListPersonalTrainersUseCase()
      const result = await useCase.execute(query)
      return reply.send(presentPaginatedTrainers(result))
    } catch (error) {
      const mapped = mapErrorToResponse(error)
      return reply.status(mapped.statusCode).send(mapped.body)
    }
  })

  app.get('/personal-trainers/featured', async (_request, reply) => {
    try {
      const useCase = makeListFeaturedTrainersUseCase()
      const trainers = await useCase.execute(6)
      return reply.send(presentFeaturedTrainers(trainers))
    } catch (error) {
      const mapped = mapErrorToResponse(error)
      return reply.status(mapped.statusCode).send(mapped.body)
    }
  })

  app.get('/personal-trainers/:id', async (request, reply) => {
    try {
      const { id } = request.params as { id: string }
      const useCase = makeGetPersonalTrainerByIdUseCase()
      const trainer = await useCase.execute(id)
      return reply.send(presentTrainerDetail(trainer))
    } catch (error) {
      const mapped = mapErrorToResponse(error)
      return reply.status(mapped.statusCode).send(mapped.body)
    }
  })
}
