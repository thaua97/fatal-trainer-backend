import type { FastifyInstance } from 'fastify'
import {
  makeExitImpersonationUseCase,
  makeListRecentImpersonationAccessUseCase,
  makeStartImpersonationUseCase,
} from '../../factories/make-use-cases'
import { requireAdminSession, requireSession } from '../../middlewares/session'
import { createFastifySessionCookieWriter } from '../../services/fastify-session-cookie-writer'
import { ADMIN_BACKUP_SESSION_COOKIE, SESSION_COOKIE } from '../../constants/session'
import { listRecentAccessSchema } from './schemas/admin-schemas'

export async function adminImpersonationRoutes(app: FastifyInstance) {
  app.post('/admin/users/:id/impersonate', async (request, reply) => {
    const admin = await requireAdminSession(request)
    const { id } = request.params as { id: string }
    const useCase = makeStartImpersonationUseCase()
    const user = await useCase.execute({
      adminUserId: admin.id,
      targetUserId: id,
      currentToken: request.cookies[SESSION_COOKIE],
      cookies: createFastifySessionCookieWriter(reply),
    })

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
    const useCase = makeExitImpersonationUseCase()
    await useCase.execute({
      sessionUser,
      currentToken: request.cookies[SESSION_COOKIE],
      adminBackupToken: request.cookies[ADMIN_BACKUP_SESSION_COOKIE],
      cookies: createFastifySessionCookieWriter(reply),
    })

    return reply.send({ success: true })
  })
}
