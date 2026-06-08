export type ReportStatus = 'pending' | 'in_review' | 'resolved' | 'archived'

import type { ReportType } from '@/domain/reports/enterprise/constants/report-options'

export type { ReportType }

export interface AdminReportListItem {
  id: string
  type: ReportType
  status: ReportStatus
  occurredAt: string
  trainerId: string
  trainerName?: string
  description: string
  contactEmail: string
  createdAt: string
  resolvedAt?: string
  resolvedBy?: string
}

export interface AdminReportListQuery {
  page: number
  pageSize: number
  status?: ReportStatus
  type?: ReportType
}

export interface AdminReportListResult {
  items: AdminReportListItem[]
  total: number
  page: number
  pageSize: number
  hasMore: boolean
}
