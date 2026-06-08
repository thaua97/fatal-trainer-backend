import type { FastifyInstance } from 'fastify'
import { parseListQuery } from '@/domain/catalog/enterprise/value-objects/list-query'
import {
  makeGetPersonalTrainerByIdUseCase,
  makeListFeaturedTrainersUseCase,
  makeListPersonalTrainersUseCase,
} from '../../factories/make-use-cases'
import {
  presentFeaturedTrainers,
  presentPaginatedTrainers,
  presentTrainerDetail,
} from '../../presenters/trainer-presenter'

export async function personalTrainersRoutes(app: FastifyInstance) {
  app.get('/personal-trainers', async (request, reply) => {
    const query = parseListQuery(request.query as Record<string, string | string[] | undefined>)
    const useCase = makeListPersonalTrainersUseCase()
    const result = await useCase.execute(query)
    return reply.send(presentPaginatedTrainers(result))
  })

  app.get('/personal-trainers/featured', async (_request, reply) => {
    const useCase = makeListFeaturedTrainersUseCase()
    const trainers = await useCase.execute(6)
    return reply.send(presentFeaturedTrainers(trainers))
  })

  app.get('/personal-trainers/:id', async (request, reply) => {
    const { id } = request.params as { id: string }
    const useCase = makeGetPersonalTrainerByIdUseCase()
    const trainer = await useCase.execute(id)
    return reply.send(presentTrainerDetail(trainer))
  })
}
