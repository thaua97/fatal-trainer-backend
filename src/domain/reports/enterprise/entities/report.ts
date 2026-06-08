import type { ReportType } from '../constants/report-options'

export type { ReportType }

export interface ReportPayload {
  type: ReportType
  occurredAt: string
  trainerId: string
  description: string
  contactEmail: string
}

export type ReportValidationErrors = Partial<Record<keyof ReportPayload, string>>

export interface ReportValidationResult {
  valid: boolean
  errors: ReportValidationErrors
}
