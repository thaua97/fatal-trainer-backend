import type { FastifyInstance } from 'fastify'
import { adminAuthRoutes } from './admin-auth.controller'
import { adminUsersRoutes } from './admin-users.controller'
import { adminImpersonationRoutes } from './admin-impersonation.controller'
import { adminReportsRoutes } from './admin-reports.controller'
import { adminPromotionsRoutes } from './admin-promotions.controller'

export async function adminRoutes(app: FastifyInstance) {
  await app.register(adminAuthRoutes)
  await app.register(adminUsersRoutes)
  await app.register(adminImpersonationRoutes)
  await app.register(adminReportsRoutes)
  await app.register(adminPromotionsRoutes)
}
