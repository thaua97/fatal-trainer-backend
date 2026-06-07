import { isValidEmail } from '@/domain/auth/enterprise/constants/auth-options'
import type { ReportPayload, ReportValidationErrors, ReportValidationResult } from '../entities/report'

const REPORT_TYPES = new Set(['inappropriate_content', 'fake_profile', 'harassment', 'other'])

export function validateReport(
  payload: ReportPayload,
  options: { trainerExists?: boolean } = {},
): ReportValidationResult {
  const errors: ReportValidationErrors = {}

  if (!payload.type || !REPORT_TYPES.has(payload.type)) {
    errors.type = 'invalid'
  }

  if (!payload.occurredAt) {
    errors.occurredAt = 'required'
  }

  if (!payload.trainerId) {
    errors.trainerId = 'required'
  } else if (options.trainerExists === false) {
    errors.trainerId = 'notFound'
  }

  const description = payload.description.trim()
  if (!description) {
    errors.description = 'required'
  } else if (description.length < 20) {
    errors.description = 'tooShort'
  }

  const contactEmail = payload.contactEmail.trim()
  if (!contactEmail) {
    errors.contactEmail = 'required'
  } else if (!isValidEmail(contactEmail)) {
    errors.contactEmail = 'invalid'
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  }
}
