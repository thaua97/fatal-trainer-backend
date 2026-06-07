import type { ReportPayload } from '../../enterprise/entities/report'

export interface CreateReportResult {
  id: string
  createdAt: string
}

export interface ReportsRepository {
  create(payload: ReportPayload): Promise<CreateReportResult>
}
