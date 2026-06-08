import { PrismaPersonalTrainersRepository } from '@/infra/database/prisma/repositories/prisma-personal-trainers-repository'
import { PrismaUsersRepository, PrismaSessionsRepository } from '@/infra/database/prisma/repositories/prisma-users-repository'
import { PrismaFavoritesRepository } from '@/infra/database/prisma/repositories/prisma-favorites-repository'
import { PrismaReportsRepository } from '@/infra/database/prisma/repositories/prisma-reports-repository'
import { PrismaReviewsRepository } from '@/infra/database/prisma/repositories/prisma-reviews-repository'
import { PrismaAdminUsersRepository } from '@/infra/database/prisma/repositories/prisma-admin-users-repository'
import { PrismaAdminReportsRepository } from '@/infra/database/prisma/repositories/prisma-admin-reports-repository'
import { PrismaAdminImpersonationLogsRepository } from '@/infra/database/prisma/repositories/prisma-admin-impersonation-logs-repository'
import { PrismaAdminUserProfileRepository } from '@/infra/database/prisma/repositories/prisma-admin-user-profile-repository'
import { PrismaPromotionTemplatesRepository } from '@/infra/database/prisma/repositories/prisma-promotion-templates-repository'

export const trainersRepository = new PrismaPersonalTrainersRepository()
export const promotionTemplatesRepository = new PrismaPromotionTemplatesRepository()
export const usersRepository = new PrismaUsersRepository()
export const sessionsRepository = new PrismaSessionsRepository()
export const favoritesRepository = new PrismaFavoritesRepository()
export const reportsRepository = new PrismaReportsRepository()
export const reviewsRepository = new PrismaReviewsRepository()
export const adminUsersRepository = new PrismaAdminUsersRepository()
export const adminReportsRepository = new PrismaAdminReportsRepository()
export const adminImpersonationLogsRepository = new PrismaAdminImpersonationLogsRepository()
export const adminUserProfileRepository = new PrismaAdminUserProfileRepository()
