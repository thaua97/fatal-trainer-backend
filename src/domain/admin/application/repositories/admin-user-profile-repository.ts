import type {
  AdminUserActivityListQuery,
  AdminUserActivityListResult,
  AdminUserDetail,
  AdminUserNote,
  AppendAdminUserActivityPayload,
} from '../../enterprise/entities/admin-user-profile'

export interface AdminUserProfileRepository {
  findDetailById(userId: string): Promise<AdminUserDetail | null>
  listActivity(userId: string, query: AdminUserActivityListQuery): Promise<AdminUserActivityListResult>
  countActivity(userId: string): Promise<number>
  appendActivity(payload: AppendAdminUserActivityPayload): Promise<void>
  listNotes(userId: string): Promise<AdminUserNote[]>
  countNotes(userId: string): Promise<number>
  createNote(userId: string, authorId: string, authorName: string, content: string): Promise<AdminUserNote>
}
