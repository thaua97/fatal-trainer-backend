import { PrismaPersonalTrainersRepository } from '@/infra/database/prisma/repositories/prisma-personal-trainers-repository'
import { PrismaUsersRepository, PrismaSessionsRepository } from '@/infra/database/prisma/repositories/prisma-users-repository'
import { PrismaFavoritesRepository } from '@/infra/database/prisma/repositories/prisma-favorites-repository'
import { PrismaReportsRepository } from '@/infra/database/prisma/repositories/prisma-reports-repository'
import { PrismaReviewsRepository } from '@/infra/database/prisma/repositories/prisma-reviews-repository'
import { ListPersonalTrainersUseCase } from '@/domain/catalog/application/use-cases/list-personal-trainers'
import { GetPersonalTrainerByIdUseCase } from '@/domain/catalog/application/use-cases/get-personal-trainer-by-id'
import { ListFeaturedTrainersUseCase } from '@/domain/catalog/application/use-cases/list-featured-trainers'
import { GetOrCreateMyTrainerUseCase } from '@/domain/catalog/application/use-cases/get-or-create-my-trainer'
import { UpdateMyTrainerUseCase } from '@/domain/catalog/application/use-cases/update-my-trainer'
import {
  DeleteGalleryImageUseCase,
  SetGalleryCoverUseCase,
  UploadGalleryImageUseCase,
} from '@/domain/catalog/application/use-cases/gallery-use-cases'
import {
  AuthenticateUserUseCase,
  CreateSessionUseCase,
  DestroySessionUseCase,
  GetCurrentUserUseCase,
  RegisterUserUseCase,
  ResolveSessionUseCase,
} from '@/domain/auth/application/use-cases/auth-use-cases'
import { GetEnrichedAuthUserUseCase } from '@/domain/auth/application/use-cases/get-enriched-auth-user'
import {
  AddFavoriteUseCase,
  ListFavoriteTrainersUseCase,
  RemoveFavoriteUseCase,
  SyncFavoritesUseCase,
} from '@/domain/favorites/application/use-cases/favorites-use-cases'
import { CreateReportUseCase } from '@/domain/reports/application/use-cases/create-report'
import { ListTrainerReviewsUseCase } from '@/domain/reviews/application/use-cases/list-trainer-reviews'
import { GetMyTrainerReviewUseCase } from '@/domain/reviews/application/use-cases/get-my-trainer-review'
import { UpsertTrainerReviewUseCase } from '@/domain/reviews/application/use-cases/upsert-trainer-review'
import {
  AdminLoginUseCase,
  CreateAdminUserUseCase,
  DeleteAdminUserUseCase,
  ImpersonateUserUseCase,
  ListAdminUsersUseCase,
  ToggleTrainerFeaturedUseCase,
  UpdateAdminUserUseCase,
} from '@/domain/admin/application/use-cases/admin-users-use-cases'
import {
  DeactivateTrainerFromReportUseCase,
  ListAdminReportsUseCase,
  UpdateReportStatusUseCase,
} from '@/domain/admin/application/use-cases/admin-reports-use-cases'
import { PrismaAdminUsersRepository } from '@/infra/database/prisma/repositories/prisma-admin-users-repository'
import { PrismaAdminReportsRepository } from '@/infra/database/prisma/repositories/prisma-admin-reports-repository'
import { PrismaAdminImpersonationLogsRepository } from '@/infra/database/prisma/repositories/prisma-admin-impersonation-logs-repository'
import { ListRecentImpersonationAccessUseCase } from '@/domain/admin/application/use-cases/admin-impersonation-use-cases'
import {
  CreateAdminUserNoteUseCase,
  GetAdminUserDetailUseCase,
  ListAdminUserActivityUseCase,
  ListAdminUserNotesUseCase,
} from '@/domain/admin/application/use-cases/admin-user-profile-use-cases'
import { PrismaAdminUserProfileRepository } from '@/infra/database/prisma/repositories/prisma-admin-user-profile-repository'
import { PrismaPromotionTemplatesRepository } from '@/infra/database/prisma/repositories/prisma-promotion-templates-repository'
import {
  CreatePromotionTemplateUseCase,
  DeletePromotionTemplateUseCase,
  GetPromotionTemplateUseCase,
  ListAvailablePromotionTemplatesUseCase,
  ListPromotionTemplatesUseCase,
  UpdatePromotionTemplateUseCase,
} from '@/domain/admin/application/use-cases/admin-promotion-templates-use-cases'

const trainersRepository = new PrismaPersonalTrainersRepository()
const promotionTemplatesRepository = new PrismaPromotionTemplatesRepository()
const usersRepository = new PrismaUsersRepository()
const sessionsRepository = new PrismaSessionsRepository()
const favoritesRepository = new PrismaFavoritesRepository()
const reportsRepository = new PrismaReportsRepository()
const reviewsRepository = new PrismaReviewsRepository()
const adminUsersRepository = new PrismaAdminUsersRepository()
const adminReportsRepository = new PrismaAdminReportsRepository()
const adminImpersonationLogsRepository = new PrismaAdminImpersonationLogsRepository()
const adminUserProfileRepository = new PrismaAdminUserProfileRepository()

export function makeListPersonalTrainersUseCase() {
  return new ListPersonalTrainersUseCase(trainersRepository)
}

export function makeGetPersonalTrainerByIdUseCase() {
  return new GetPersonalTrainerByIdUseCase(trainersRepository)
}

export function makeListFeaturedTrainersUseCase() {
  return new ListFeaturedTrainersUseCase(trainersRepository)
}

export function makeGetOrCreateMyTrainerUseCase() {
  return new GetOrCreateMyTrainerUseCase(trainersRepository)
}

export function makeUpdateMyTrainerUseCase() {
  return new UpdateMyTrainerUseCase(
    trainersRepository,
    usersRepository,
    promotionTemplatesRepository,
  )
}

export function makeUploadGalleryImageUseCase() {
  return new UploadGalleryImageUseCase(trainersRepository)
}

export function makeDeleteGalleryImageUseCase() {
  return new DeleteGalleryImageUseCase(trainersRepository)
}

export function makeSetGalleryCoverUseCase() {
  return new SetGalleryCoverUseCase(trainersRepository)
}

export function makeRegisterUserUseCase() {
  return new RegisterUserUseCase(usersRepository)
}

export function makeAuthenticateUserUseCase() {
  return new AuthenticateUserUseCase(usersRepository)
}

export function makeGetEnrichedAuthUserUseCase() {
  return new GetEnrichedAuthUserUseCase(usersRepository, trainersRepository)
}

export function makeGetCurrentUserUseCase() {
  return new GetCurrentUserUseCase(usersRepository)
}

export function makeCreateSessionUseCase() {
  return new CreateSessionUseCase(sessionsRepository)
}

export function makeDestroySessionUseCase() {
  return new DestroySessionUseCase(sessionsRepository)
}

export function makeResolveSessionUseCase() {
  return new ResolveSessionUseCase(sessionsRepository, usersRepository)
}

export function makeListFavoriteTrainersUseCase() {
  return new ListFavoriteTrainersUseCase(favoritesRepository, trainersRepository)
}

export function makeSyncFavoritesUseCase() {
  return new SyncFavoritesUseCase(favoritesRepository)
}

export function makeAddFavoriteUseCase() {
  return new AddFavoriteUseCase(favoritesRepository)
}

export function makeRemoveFavoriteUseCase() {
  return new RemoveFavoriteUseCase(favoritesRepository)
}

export function makeCreateReportUseCase() {
  return new CreateReportUseCase(reportsRepository, trainersRepository)
}

export function makeListTrainerReviewsUseCase() {
  return new ListTrainerReviewsUseCase(reviewsRepository)
}

export function makeGetMyTrainerReviewUseCase() {
  return new GetMyTrainerReviewUseCase(reviewsRepository)
}

export function makeUpsertTrainerReviewUseCase() {
  return new UpsertTrainerReviewUseCase(reviewsRepository, trainersRepository)
}

export function makeAdminLoginUseCase() {
  return new AdminLoginUseCase(usersRepository)
}

export function makeListAdminUsersUseCase() {
  return new ListAdminUsersUseCase(adminUsersRepository)
}

export function makeCreateAdminUserUseCase() {
  return new CreateAdminUserUseCase(adminUsersRepository)
}

export function makeUpdateAdminUserUseCase() {
  return new UpdateAdminUserUseCase(adminUsersRepository)
}

export function makeToggleTrainerFeaturedUseCase() {
  return new ToggleTrainerFeaturedUseCase(adminUsersRepository)
}

export function makeDeleteAdminUserUseCase() {
  return new DeleteAdminUserUseCase(adminUsersRepository)
}

export function makeImpersonateUserUseCase() {
  return new ImpersonateUserUseCase(
    adminUsersRepository,
    adminImpersonationLogsRepository,
    adminUserProfileRepository,
  )
}

export function makeGetAdminUserDetailUseCase() {
  return new GetAdminUserDetailUseCase(adminUsersRepository, adminUserProfileRepository)
}

export function makeListAdminUserActivityUseCase() {
  return new ListAdminUserActivityUseCase(adminUsersRepository, adminUserProfileRepository)
}

export function makeListAdminUserNotesUseCase() {
  return new ListAdminUserNotesUseCase(adminUsersRepository, adminUserProfileRepository)
}

export function makeCreateAdminUserNoteUseCase() {
  return new CreateAdminUserNoteUseCase(adminUsersRepository, adminUserProfileRepository)
}

export function makeListRecentImpersonationAccessUseCase() {
  return new ListRecentImpersonationAccessUseCase(adminImpersonationLogsRepository)
}

export function makeListAdminReportsUseCase() {
  return new ListAdminReportsUseCase(adminReportsRepository)
}

export function makeUpdateReportStatusUseCase() {
  return new UpdateReportStatusUseCase(adminReportsRepository)
}

export function makeDeactivateTrainerFromReportUseCase() {
  return new DeactivateTrainerFromReportUseCase(adminReportsRepository)
}

export function makeListPromotionTemplatesUseCase() {
  return new ListPromotionTemplatesUseCase(promotionTemplatesRepository)
}

export function makeGetPromotionTemplateUseCase() {
  return new GetPromotionTemplateUseCase(promotionTemplatesRepository)
}

export function makeCreatePromotionTemplateUseCase() {
  return new CreatePromotionTemplateUseCase(promotionTemplatesRepository)
}

export function makeUpdatePromotionTemplateUseCase() {
  return new UpdatePromotionTemplateUseCase(promotionTemplatesRepository)
}

export function makeDeletePromotionTemplateUseCase() {
  return new DeletePromotionTemplateUseCase(promotionTemplatesRepository)
}

export function makeListAvailablePromotionTemplatesUseCase() {
  return new ListAvailablePromotionTemplatesUseCase(promotionTemplatesRepository)
}

export { trainersRepository, usersRepository, promotionTemplatesRepository }
