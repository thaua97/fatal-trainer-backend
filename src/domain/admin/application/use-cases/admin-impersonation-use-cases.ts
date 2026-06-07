import type { AdminRecentAccessItem } from '../../enterprise/entities/admin-impersonation-log'
import type { AdminImpersonationLogsRepository } from '../repositories/admin-impersonation-logs-repository'

export class ListRecentImpersonationAccessUseCase {
  constructor(private readonly logsRepository: AdminImpersonationLogsRepository) {}

  async execute(adminUserId: string, limit = 8): Promise<AdminRecentAccessItem[]> {
    return this.logsRepository.findRecentByAdmin(adminUserId, limit)
  }
}
