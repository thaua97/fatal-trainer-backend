import type {
  AdminReportListItem,
  AdminReportListQuery,
  AdminReportListResult,
  ReportStatus,
} from '../../enterprise/entities/admin-report'

export interface AdminReportsRepository {
  findMany(query: AdminReportListQuery): Promise<AdminReportListResult>
  findById(id: string): Promise<AdminReportListItem | null>
  updateStatus(id: string, status: ReportStatus, resolvedBy?: string): Promise<AdminReportListItem>
  deactivateTrainerFromReport(reportId: string, adminId: string): Promise<AdminReportListItem>
}
