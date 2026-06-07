import { ResourceNotFoundError, ValidationError } from '@/domain/shared/errors/domain-errors'
import type { ReportStatus } from '../../enterprise/entities/admin-report'
import type { AdminReportListQuery } from '../../enterprise/entities/admin-report'
import type { AdminReportsRepository } from '../repositories/admin-reports-repository'

const VALID_STATUSES: ReportStatus[] = ['pending', 'in_review', 'resolved', 'archived']

export class ListAdminReportsUseCase {
  constructor(private readonly adminReportsRepository: AdminReportsRepository) {}

  async execute(query: AdminReportListQuery) {
    return this.adminReportsRepository.findMany(query)
  }
}

export class UpdateReportStatusUseCase {
  constructor(private readonly adminReportsRepository: AdminReportsRepository) {}

  async execute(reportId: string, status: ReportStatus, adminId: string) {
    if (!VALID_STATUSES.includes(status)) {
      throw new ValidationError({ status: 'invalid' })
    }

    const report = await this.adminReportsRepository.findById(reportId)
    if (!report) {
      throw new ResourceNotFoundError()
    }

    const resolvedBy = status === 'resolved' || status === 'archived' ? adminId : undefined
    return this.adminReportsRepository.updateStatus(reportId, status, resolvedBy)
  }
}

export class DeactivateTrainerFromReportUseCase {
  constructor(private readonly adminReportsRepository: AdminReportsRepository) {}

  async execute(reportId: string, adminId: string) {
    const report = await this.adminReportsRepository.findById(reportId)
    if (!report) {
      throw new ResourceNotFoundError()
    }

    return this.adminReportsRepository.deactivateTrainerFromReport(reportId, adminId)
  }
}
