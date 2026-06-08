import type {
  CreatePromotionTemplatePayload,
  UpdatePromotionTemplatePayload,
} from '@/domain/admin/enterprise/entities/admin-promotion-template'

function isValidDateString(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false
  const date = new Date(`${value}T12:00:00`)
  return !Number.isNaN(date.getTime())
}

export type PromotionTemplateValidationErrors = Partial<
  Record<
    | 'name'
    | 'label'
    | 'discountPercent'
    | 'startsAt'
    | 'endsAt'
    | 'maxRedemptions',
    string
  >
>

export function validatePromotionTemplateFields(
  payload: {
    name?: string
    label?: string
    discountPercent?: number
    startsAt?: string
    endsAt?: string
    maxRedemptions?: number | null
  },
): { valid: boolean; errors: PromotionTemplateValidationErrors } {
  const errors: PromotionTemplateValidationErrors = {}

  if (payload.name !== undefined) {
    if (!payload.name.trim()) errors.name = 'required'
  }

  if (payload.label !== undefined) {
    if (!payload.label.trim()) errors.label = 'required'
  }

  if (payload.discountPercent !== undefined) {
    if (
      !Number.isFinite(payload.discountPercent) ||
      payload.discountPercent < 5 ||
      payload.discountPercent > 80
    ) {
      errors.discountPercent = 'invalid'
    }
  }

  if (payload.startsAt !== undefined) {
    if (!payload.startsAt) errors.startsAt = 'required'
    else if (!isValidDateString(payload.startsAt)) errors.startsAt = 'invalid'
  }

  if (payload.endsAt !== undefined) {
    if (!payload.endsAt) errors.endsAt = 'required'
    else if (!isValidDateString(payload.endsAt)) errors.endsAt = 'invalid'
    else if (
      payload.startsAt &&
      isValidDateString(payload.startsAt) &&
      payload.endsAt < payload.startsAt
    ) {
      errors.endsAt = 'beforeStart'
    }
  }

  if (payload.maxRedemptions != null) {
    if (!Number.isInteger(payload.maxRedemptions) || payload.maxRedemptions < 1) {
      errors.maxRedemptions = 'invalid'
    }
  }

  return { valid: Object.keys(errors).length === 0, errors }
}

export function validateCreatePromotionTemplate(
  payload: CreatePromotionTemplatePayload,
) {
  return validatePromotionTemplateFields({
    name: payload.name,
    label: payload.label,
    discountPercent: payload.discountPercent,
    startsAt: payload.startsAt,
    endsAt: payload.endsAt,
    maxRedemptions: payload.maxRedemptions,
  })
}

export function validateUpdatePromotionTemplate(
  payload: UpdatePromotionTemplatePayload,
  current?: { startsAt: string; endsAt: string },
) {
  const startsAt = payload.startsAt ?? current?.startsAt
  const endsAt = payload.endsAt ?? current?.endsAt

  return validatePromotionTemplateFields({
    name: payload.name,
    label: payload.label,
    discountPercent: payload.discountPercent,
    startsAt,
    endsAt,
    maxRedemptions: payload.maxRedemptions,
  })
}
