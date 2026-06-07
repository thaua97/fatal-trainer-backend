import type {
  AdminRecentAccessItem,
  CreateImpersonationLogPayload,
} from '../../enterprise/entities/admin-impersonation-log'

export interface AdminImpersonationLogsRepository {
  create(payload: CreateImpersonationLogPayload): Promise<void>
  findRecentByAdmin(adminUserId: string, limit: number): Promise<AdminRecentAccessItem[]>
}
