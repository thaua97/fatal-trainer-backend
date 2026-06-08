import { ResourceNotFoundError, ValidationError } from '@/domain/shared/errors/domain-errors'
import type { AdminUsersRepository } from '../repositories/admin-users-repository'
import type { AdminUserProfileRepository } from '../repositories/admin-user-profile-repository'
import type {
  AdminUserActivityListQuery,
  AdminUserDetail,
  AdminUserNote,
} from '../../enterprise/entities/admin-user-profile'

export class GetAdminUserDetailUseCase {
  constructor(
    private readonly adminUsersRepository: AdminUsersRepository,
    private readonly profileRepository: AdminUserProfileRepository,
  ) {}

  async execute(userId: string): Promise<AdminUserDetail> {
    const user = await this.adminUsersRepository.findById(userId)
    if (!user) {
      throw new ResourceNotFoundError()
    }

    const detail = await this.profileRepository.findDetailById(userId)
    if (!detail) {
      throw new ResourceNotFoundError()
    }

    return detail
  }
}

export class ListAdminUserActivityUseCase {
  constructor(
    private readonly adminUsersRepository: AdminUsersRepository,
    private readonly profileRepository: AdminUserProfileRepository,
  ) {}

  async execute(userId: string, query: AdminUserActivityListQuery) {
    const user = await this.adminUsersRepository.findById(userId)
    if (!user) {
      throw new ResourceNotFoundError()
    }

    return this.profileRepository.listActivity(userId, query)
  }
}

export class ListAdminUserNotesUseCase {
  constructor(
    private readonly adminUsersRepository: AdminUsersRepository,
    private readonly profileRepository: AdminUserProfileRepository,
  ) {}

  async execute(userId: string): Promise<{ items: AdminUserNote[] }> {
    const user = await this.adminUsersRepository.findById(userId)
    if (!user) {
      throw new ResourceNotFoundError()
    }

    const items = await this.profileRepository.listNotes(userId)
    return { items }
  }
}

export class CreateAdminUserNoteUseCase {
  constructor(
    private readonly adminUsersRepository: AdminUsersRepository,
    private readonly profileRepository: AdminUserProfileRepository,
  ) {}

  async execute(
    userId: string,
    authorId: string,
    authorName: string,
    content: string,
  ): Promise<{ note: AdminUserNote }> {
    const user = await this.adminUsersRepository.findById(userId)
    if (!user) {
      throw new ResourceNotFoundError()
    }

    const trimmed = content.trim()
    if (!trimmed) {
      throw new ValidationError({ content: 'required' })
    }

    const note = await this.profileRepository.createNote(userId, authorId, authorName, trimmed)
    return { note }
  }
}
