import { hash } from 'bcryptjs'
import {
  ForbiddenError,
  InvalidCredentialsError,
  ResourceNotFoundError,
  UserAlreadyExistsError,
  ValidationError,
} from '@/domain/shared/errors/domain-errors'
import type { AuthUser } from '@/domain/auth/enterprise/entities/user'
import { validateLogin } from '@/domain/auth/enterprise/services/validate-auth'
import { mapStoredUserToAuthUser } from '@/domain/auth/enterprise/services/build-auth-user'
import type { UsersRepository } from '@/domain/auth/application/repositories/users-repository'
import type {
  AdminUserListQuery,
  AdminUserListResult,
  CreateAdminUserPayload,
  UpdateAdminUserPayload,
} from '../../enterprise/entities/admin-user'
import type { TrainerPromotion } from '@/domain/catalog/enterprise/entities/personal-trainer'
import type { AdminUsersRepository } from '../repositories/admin-users-repository'
import type { AdminImpersonationLogsRepository } from '../repositories/admin-impersonation-logs-repository'
import type { AdminUserProfileRepository } from '../repositories/admin-user-profile-repository'

export class AdminLoginUseCase {
  constructor(private readonly usersRepository: UsersRepository) {}

  async execute(email: string, password: string): Promise<AuthUser> {
    const validation = validateLogin({ email, password })
    if (!validation.valid) {
      throw new ValidationError(validation.errors)
    }

    const user = await this.usersRepository.findByEmail(email)
    if (!user || !user.isActive) {
      throw new InvalidCredentialsError()
    }

    if (user.role !== 'admin') {
      throw new ForbiddenError()
    }

    const { compare } = await import('bcryptjs')
    const valid = await compare(password, user.passwordHash)
    if (!valid) {
      throw new InvalidCredentialsError()
    }

    return mapStoredUserToAuthUser(user)
  }
}

export class ListAdminUsersUseCase {
  constructor(private readonly adminUsersRepository: AdminUsersRepository) {}

  async execute(query: AdminUserListQuery): Promise<AdminUserListResult> {
    return this.adminUsersRepository.findMany(query)
  }
}

export class CreateAdminUserUseCase {
  constructor(private readonly adminUsersRepository: AdminUsersRepository) {}

  async execute(payload: CreateAdminUserPayload): Promise<AdminUserListResult['items'][0]> {
    if (!payload.name?.trim()) {
      throw new ValidationError({ name: 'required' })
    }
    if (!payload.email?.trim()) {
      throw new ValidationError({ email: 'required' })
    }
    if (!payload.password || payload.password.length < 6) {
      throw new ValidationError({ password: 'minLength' })
    }

    const exists = await this.adminUsersRepository.emailExists(payload.email)
    if (exists) {
      throw new UserAlreadyExistsError()
    }

    const passwordHash = await hash(payload.password, 10)
    return this.adminUsersRepository.create(payload, passwordHash)
  }
}

export class UpdateAdminUserUseCase {
  constructor(private readonly adminUsersRepository: AdminUsersRepository) {}

  async execute(id: string, payload: UpdateAdminUserPayload) {
    const user = await this.adminUsersRepository.findById(id)
    if (!user) {
      throw new ResourceNotFoundError()
    }

    if (payload.email) {
      const exists = await this.adminUsersRepository.emailExists(payload.email, id)
      if (exists) {
        throw new UserAlreadyExistsError()
      }
    }

    return this.adminUsersRepository.update(id, payload)
  }
}

export class ToggleTrainerFeaturedUseCase {
  constructor(private readonly adminUsersRepository: AdminUsersRepository) {}

  async execute(userId: string, featured: boolean) {
    const user = await this.adminUsersRepository.findById(userId)
    if (!user) {
      throw new ResourceNotFoundError()
    }
    if (user.role !== 'personal-trainer') {
      throw new ValidationError({ role: 'mustBeTrainer' })
    }

    return this.adminUsersRepository.toggleFeatured(userId, featured)
  }
}

export class DeleteAdminUserUseCase {
  constructor(private readonly adminUsersRepository: AdminUsersRepository) {}

  async execute(adminUserId: string, targetUserId: string): Promise<void> {
    if (adminUserId === targetUserId) {
      throw new ForbiddenError()
    }

    const user = await this.adminUsersRepository.findById(targetUserId)
    if (!user) {
      throw new ResourceNotFoundError()
    }

    await this.adminUsersRepository.delete(targetUserId)
  }
}

export class ImpersonateUserUseCase {
  constructor(
    private readonly adminUsersRepository: AdminUsersRepository,
    private readonly logsRepository: AdminImpersonationLogsRepository,
    private readonly profileRepository?: AdminUserProfileRepository,
  ) {}

  async execute(adminUserId: string, targetUserId: string): Promise<AuthUser> {
    if (adminUserId === targetUserId) {
      throw new ForbiddenError()
    }

    const user = await this.adminUsersRepository.findById(targetUserId)
    if (!user) {
      throw new ResourceNotFoundError()
    }
    if (!user.isActive) {
      throw new ForbiddenError()
    }

    const admin = await this.adminUsersRepository.findById(adminUserId)

    await this.logsRepository.create({
      adminUserId,
      targetUserId: user.id,
      targetName: user.name,
      targetRole: user.role,
    })

    await this.profileRepository?.appendActivity({
      userId: user.id,
      type: 'admin_impersonation',
      title: 'Acesso como usuário',
      description: admin ? `${admin.name} acessou a conta deste usuário` : undefined,
      actorId: adminUserId,
      actorName: admin?.name,
      actorRole: admin?.role ?? 'admin',
    })

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      phoneNumber: user.phoneNumber,
      avatarUrl: user.avatarUrl,
      city: user.city,
      state: user.state,
      isActive: user.isActive,
      createdAt: user.createdAt,
      isImpersonating: true,
    }
  }
}
