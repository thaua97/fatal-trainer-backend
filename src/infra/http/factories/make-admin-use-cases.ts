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
import { ListRecentImpersonationAccessUseCase } from '@/domain/admin/application/use-cases/admin-impersonation-use-cases'
import { StartImpersonationUseCase } from '@/domain/admin/application/use-cases/start-impersonation'
import { ExitImpersonationUseCase } from '@/domain/admin/application/use-cases/exit-impersonation'
import {
  CreateAdminUserNoteUseCase,
  GetAdminUserDetailUseCase,
  ListAdminUserActivityUseCase,
  ListAdminUserNotesUseCase,
} from '@/domain/admin/application/use-cases/admin-user-profile-use-cases'
import {
  CreatePromotionTemplateUseCase,
  DeletePromotionTemplateUseCase,
  GetPromotionTemplateUseCase,
  ListAvailablePromotionTemplatesUseCase,
  ListPromotionTemplatesUseCase,
  UpdatePromotionTemplateUseCase,
} from '@/domain/admin/application/use-cases/admin-promotion-templates-use-cases'
import {
  adminImpersonationLogsRepository,
  adminReportsRepository,
  adminUserProfileRepository,
  adminUsersRepository,
  promotionTemplatesRepository,
  usersRepository,
} from './make-repositories'
import { makeCreateSessionUseCase, makeDestroySessionUseCase } from './make-auth-use-cases'

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

export function makeStartImpersonationUseCase() {
  return new StartImpersonationUseCase(
    makeImpersonateUserUseCase(),
    makeCreateSessionUseCase(),
    makeDestroySessionUseCase(),
  )
}

export function makeExitImpersonationUseCase() {
  return new ExitImpersonationUseCase(makeDestroySessionUseCase())
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
