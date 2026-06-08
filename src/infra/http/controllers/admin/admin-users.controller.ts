import type { FastifyInstance } from 'fastify'
import {
  makeCreateAdminUserNoteUseCase,
  makeCreateAdminUserUseCase,
  makeDeleteAdminUserUseCase,
  makeGetAdminUserDetailUseCase,
  makeListAdminUserActivityUseCase,
  makeListAdminUserNotesUseCase,
  makeListAdminUsersUseCase,
  makeToggleTrainerFeaturedUseCase,
  makeUpdateAdminUserUseCase,
} from '../../factories/make-use-cases'
import { requireAdminSession } from '../../middlewares/session'
import {
  createNoteSchema,
  createUserSchema,
  listActivitySchema,
  listUsersSchema,
  toggleFeaturedSchema,
  updateUserSchema,
} from './schemas/admin-schemas'

export async function adminUsersRoutes(app: FastifyInstance) {
  app.get('/admin/users', async (request, reply) => {
    await requireAdminSession(request)
    const query = listUsersSchema.parse(request.query)
    const useCase = makeListAdminUsersUseCase()
    const result = await useCase.execute(query)
    return reply.send(result)
  })

  app.post('/admin/users', async (request, reply) => {
    await requireAdminSession(request)
    const body = createUserSchema.parse(request.body)
    const useCase = makeCreateAdminUserUseCase()
    const user = await useCase.execute(body)
    return reply.status(201).send({ user })
  })

  app.get('/admin/users/:id', async (request, reply) => {
    await requireAdminSession(request)
    const { id } = request.params as { id: string }
    const useCase = makeGetAdminUserDetailUseCase()
    const user = await useCase.execute(id)
    return reply.send({ user })
  })

  app.get('/admin/users/:id/activity', async (request, reply) => {
    await requireAdminSession(request)
    const { id } = request.params as { id: string }
    const query = listActivitySchema.parse(request.query)
    const useCase = makeListAdminUserActivityUseCase()
    const result = await useCase.execute(id, query)
    return reply.send(result)
  })

  app.get('/admin/users/:id/notes', async (request, reply) => {
    await requireAdminSession(request)
    const { id } = request.params as { id: string }
    const useCase = makeListAdminUserNotesUseCase()
    const result = await useCase.execute(id)
    return reply.send(result)
  })

  app.post('/admin/users/:id/notes', async (request, reply) => {
    const admin = await requireAdminSession(request)
    const { id } = request.params as { id: string }
    const body = createNoteSchema.parse(request.body)
    const useCase = makeCreateAdminUserNoteUseCase()
    const result = await useCase.execute(id, admin.id, admin.name, body.content)
    return reply.status(201).send(result)
  })

  app.patch('/admin/users/:id', async (request, reply) => {
    await requireAdminSession(request)
    const { id } = request.params as { id: string }
    const body = updateUserSchema.parse(request.body)
    const useCase = makeUpdateAdminUserUseCase()
    const user = await useCase.execute(id, body)
    return reply.send({ user })
  })

  app.delete('/admin/users/:id', async (request, reply) => {
    const admin = await requireAdminSession(request)
    const { id } = request.params as { id: string }
    const useCase = makeDeleteAdminUserUseCase()
    await useCase.execute(admin.id, id)
    return reply.status(204).send()
  })

  app.patch('/admin/users/:id/featured', async (request, reply) => {
    await requireAdminSession(request)
    const { id } = request.params as { id: string }
    const body = toggleFeaturedSchema.parse(request.body)
    const useCase = makeToggleTrainerFeaturedUseCase()
    const user = await useCase.execute(id, body.featured)
    return reply.send({ user })
  })
}
