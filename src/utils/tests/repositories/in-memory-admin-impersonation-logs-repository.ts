import { randomUUID } from 'node:crypto'
import type { AdminImpersonationLogsRepository } from '@/domain/admin/application/repositories/admin-impersonation-logs-repository'
import type {
  AdminRecentAccessItem,
  CreateImpersonationLogPayload,
} from '@/domain/admin/enterprise/entities/admin-impersonation-log'

export class InMemoryAdminImpersonationLogsRepository implements AdminImpersonationLogsRepository {
  public items: AdminRecentAccessItem[] = []

  async create(payload: CreateImpersonationLogPayload): Promise<void> {
    this.items.unshift({
      id: randomUUID(),
      targetUserId: payload.targetUserId,
      targetName: payload.targetName,
      targetRole: payload.targetRole,
      accessedAt: new Date().toISOString(),
    })
  }

  async findRecentByAdmin(adminUserId: string, limit: number): Promise<AdminRecentAccessItem[]> {
    void adminUserId
    return this.items.slice(0, limit)
  }
}
