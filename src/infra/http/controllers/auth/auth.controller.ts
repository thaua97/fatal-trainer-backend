import type { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { randomUUID } from 'node:crypto'
import {
  makeAuthenticateUserUseCase,
  makeCreateSessionUseCase,
  makeDestroySessionUseCase,
  makeGetEnrichedAuthUserUseCase,
  makeRegisterUserUseCase,
} from '../../factories/make-use-cases'
import { mapErrorToResponse } from '../../errors/map-error-to-response'
import {
  clearSessionCookie,
  requireSession,
  setSessionCookie,
} from '../../middlewares/session'
import { SESSION_COOKIE } from '../../constants/session'

const registerSchema = z.object({
  name: z.string(),
  email: z.string(),
  password: z.string(),
  confirmPassword: z.string(),
  role: z.enum(['student', 'personal-trainer']),
  termsAccepted: z.boolean(),
})

const loginSchema = z.object({
  email: z.string(),
  password: z.string(),
})

export async function authRoutes(app: FastifyInstance) {
  app.post('/auth/register', async (request, reply) => {
    try {
      const body = registerSchema.parse(request.body)
      const useCase = makeRegisterUserUseCase()
      const user = await useCase.execute(body)

      const token = randomUUID()
      const createSession = makeCreateSessionUseCase()
      await createSession.execute(user.id, token)
      setSessionCookie(reply, token)

      const enrich = makeGetEnrichedAuthUserUseCase()
      const enrichedUser = await enrich.execute(user.id)

      return reply.status(201).send({ user: enrichedUser })
    } catch (error) {
      const mapped = mapErrorToResponse(error)
      return reply.status(mapped.statusCode).send(mapped.body)
    }
  })

  app.post('/auth/login', async (request, reply) => {
    try {
      const body = loginSchema.parse(request.body)
      const useCase = makeAuthenticateUserUseCase()
      const user = await useCase.execute(body.email, body.password)

      const token = randomUUID()
      const createSession = makeCreateSessionUseCase()
      await createSession.execute(user.id, token)
      setSessionCookie(reply, token)

      const enrich = makeGetEnrichedAuthUserUseCase()
      const enrichedUser = await enrich.execute(user.id)

      return reply.send({ user: enrichedUser })
    } catch (error) {
      const mapped = mapErrorToResponse(error)
      return reply.status(mapped.statusCode).send(mapped.body)
    }
  })

  app.get('/auth/me', async (request, reply) => {
    try {
      const sessionUser = await requireSession(request)
      const enrich = makeGetEnrichedAuthUserUseCase()
      const user = await enrich.execute(sessionUser.id, {
        impersonatorUserId: sessionUser.impersonatorId,
      })
      return reply.send({ user })
    } catch (error) {
      const mapped = mapErrorToResponse(error)
      return reply.status(mapped.statusCode).send(mapped.body)
    }
  })

  app.post('/auth/logout', async (request, reply) => {
    try {
      const token = request.cookies[SESSION_COOKIE]
      const destroySession = makeDestroySessionUseCase()
      await destroySession.execute(token ?? '')
      clearSessionCookie(reply)
      return reply.status(204).send()
    } catch (error) {
      const mapped = mapErrorToResponse(error)
      return reply.status(mapped.statusCode).send(mapped.body)
    }
  })
}
