import type { FastifyInstance } from 'fastify'
import { randomUUID } from 'node:crypto'
import { makeAdminLoginUseCase, makeCreateSessionUseCase } from '../../factories/make-use-cases'
import { setSessionCookie } from '../../middlewares/session'
import { loginSchema } from './schemas/admin-schemas'

export async function adminAuthRoutes(app: FastifyInstance) {
  app.post('/admin/auth/login', async (request, reply) => {
    const body = loginSchema.parse(request.body)
    const useCase = makeAdminLoginUseCase()
    const user = await useCase.execute(body.email, body.password)

    const token = randomUUID()
    const createSession = makeCreateSessionUseCase()
    await createSession.execute(user.id, token)
    setSessionCookie(reply, token)

    return reply.send({ user })
  })
}
