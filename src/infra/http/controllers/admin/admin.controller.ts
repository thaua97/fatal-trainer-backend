import type { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { randomUUID } from 'node:crypto'
import {
  makeAdminLoginUseCase,
  makeCreateAdminUserUseCase,
  makeDeleteAdminUserUseCase,
  makeCreateSessionUseCase,
  makeCreateAdminUserNoteUseCase,
  makeDeactivateTrainerFromReportUseCase,
  makeDestroySessionUseCase,
  makeGetAdminUserDetailUseCase,
  makeImpersonateUserUseCase,
  makeListAdminReportsUseCase,
  makeListAdminUserActivityUseCase,
  makeListAdminUserNotesUseCase,
  makeListAdminUsersUseCase,
  makeListRecentImpersonationAccessUseCase,
  makeToggleTrainerFeaturedUseCase,
  makeUpdateAdminUserUseCase,
  makeUpdateReportStatusUseCase,
  makeListPromotionTemplatesUseCase,
  makeGetPromotionTemplateUseCase,
  makeCreatePromotionTemplateUseCase,
  makeUpdatePromotionTemplateUseCase,
  makeDeletePromotionTemplateUseCase,
} from '../../factories/make-use-cases'
import { ValidationError } from '@/domain/shared/errors/domain-errors'
import {
  clearAdminBackupCookie,
  clearSessionCookie,
  requireAdminSession,
  requireSession,
  setAdminBackupCookie,
  setSessionCookie,
} from '../../middlewares/session'
import { ADMIN_BACKUP_SESSION_COOKIE, SESSION_COOKIE } from '../../constants/session'

const loginSchema = z.object({
  email: z.string(),
  password: z.string(),
})

const listUsersSchema = z.object({
  page: z.coerce.number().min(1).default(1),
  pageSize: z.coerce.number().min(1).max(100).default(20),
  search: z.string().optional(),
  role: z.enum(['student', 'personal-trainer', 'admin']).optional(),
  isActive: z.coerce.boolean().optional(),
})

const createUserSchema = z.object({
  name: z.string(),
  email: z.string(),
  password: z.string(),
  role: z.enum(['student', 'personal-trainer', 'admin']),
  phoneNumber: z.string().optional(),
})

const updateUserSchema = z.object({
  name: z.string().optional(),
  email: z.string().optional(),
  role: z.enum(['student', 'personal-trainer', 'admin']).optional(),
  isActive: z.boolean().optional(),
  phoneNumber: z.string().optional(),
})

const toggleFeaturedSchema = z.object({
  featured: z.boolean(),
})

const listRecentAccessSchema = z.object({
  limit: z.coerce.number().min(1).max(20).default(8),
})

const listActivitySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  pageSize: z.coerce.number().min(1).max(50).default(10),
})

const createNoteSchema = z.object({
  content: z.string().min(1),
})

const listReportsSchema = z.object({
  page: z.coerce.number().min(1).default(1),
  pageSize: z.coerce.number().min(1).max(100).default(20),
  status: z.enum(['pending', 'in_review', 'resolved', 'archived']).optional(),
  type: z.enum(['inappropriate_content', 'fake_profile', 'harassment', 'other']).optional(),
})

const updateReportSchema = z.object({
  status: z.enum(['pending', 'in_review', 'resolved', 'archived']),
})

const listPromotionsSchema = z.object({
  page: z.coerce.number().min(1).default(1),
  pageSize: z.coerce.number().min(1).max(100).default(20),
  search: z.string().optional(),
  isActive: z.coerce.boolean().optional(),
  status: z.enum(['active', 'upcoming', 'expired']).optional(),
})

const createPromotionSchema = z.object({
  name: z.string(),
  label: z.string(),
  discountPercent: z.number(),
  startsAt: z.string(),
  endsAt: z.string(),
  maxRedemptions: z.number().nullable().optional(),
  isActive: z.boolean().optional(),
})

const updatePromotionSchema = z.object({
  name: z.string().optional(),
  label: z.string().optional(),
  discountPercent: z.number().optional(),
  startsAt: z.string().optional(),
  endsAt: z.string().optional(),
  maxRedemptions: z.number().nullable().optional(),
  isActive: z.boolean().optional(),
})

export async function adminRoutes(app: FastifyInstance) {
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

  app.post('/admin/users/:id/impersonate', async (request, reply) => {
      const admin = await requireAdminSession(request)
      const { id } = request.params as { id: string }
      const useCase = makeImpersonateUserUseCase()
      const user = await useCase.execute(admin.id, id)

      const currentToken = request.cookies[SESSION_COOKIE]
      if (currentToken) {
        setAdminBackupCookie(reply, currentToken)
      }

      const destroySession = makeDestroySessionUseCase()
      if (currentToken) {
        await destroySession.execute(currentToken)
      }

      const token = randomUUID()
      const createSession = makeCreateSessionUseCase()
      await createSession.execute(user.id, token, admin.id)
      setSessionCookie(reply, token)

      return reply.send({ user })
  })

  app.get('/admin/impersonation/recent', async (request, reply) => {
      const admin = await requireAdminSession(request)
      const query = listRecentAccessSchema.parse(request.query)
      const useCase = makeListRecentImpersonationAccessUseCase()
      const items = await useCase.execute(admin.id, query.limit)
      return reply.send({ items })
  })

  app.post('/admin/impersonation/exit', async (request, reply) => {
      const sessionUser = await requireSession(request)
      if (!sessionUser.isImpersonating) {
        throw new ValidationError({ impersonation: 'notActive' })
      }

      const currentToken = request.cookies[SESSION_COOKIE]
      const adminToken = request.cookies[ADMIN_BACKUP_SESSION_COOKIE]

      const destroySession = makeDestroySessionUseCase()
      if (currentToken) {
        await destroySession.execute(currentToken)
      }

      if (adminToken) {
        setSessionCookie(reply, adminToken)
        clearAdminBackupCookie(reply)
      } else {
        clearSessionCookie(reply)
      }

      return reply.send({ success: true })
  })

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
