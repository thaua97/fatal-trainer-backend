import type {
  AdminUserListItem,
  AdminUserListQuery,
  AdminUserListResult,
  CreateAdminUserPayload,
  UpdateAdminUserPayload,
} from '../../enterprise/entities/admin-user'

export interface AdminUsersRepository {
  findMany(query: AdminUserListQuery): Promise<AdminUserListResult>
  findById(id: string): Promise<AdminUserListItem | null>
  create(payload: CreateAdminUserPayload, passwordHash: string): Promise<AdminUserListItem>
  update(id: string, payload: UpdateAdminUserPayload): Promise<AdminUserListItem>
  toggleFeatured(userId: string, featured: boolean): Promise<AdminUserListItem>
  emailExists(email: string, excludeId?: string): Promise<boolean>
  delete(id: string): Promise<void>
}

export interface AdminTrainerCreator {
  createMinimalTrainer(userId: string, name: string): Promise<string>
}
