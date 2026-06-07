import {
  CATALOG_MODALITIES,
  CATALOG_SPECIALTIES,
} from '../constants/catalog-options'
import type {
  TrainerInfoPayload,
  TrainerInfoValidationErrors,
  TrainerProfileValidationResult,
  TrainerPromotionPayload,
  TrainerPromotionValidationErrors,
} from '../entities/trainer-profile-payloads'

const BRAZILIAN_STATES = new Set([
  'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MT', 'MS', 'MG',
  'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO',
])

function countPhoneDigits(phone: string): number {
  return phone.replace(/\D/g, '').length
}

function isValidDateString(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false
  const date = new Date(`${value}T12:00:00`)
  return !Number.isNaN(date.getTime())
}

export function validateTrainerInfo(
  payload: TrainerInfoPayload,
): TrainerProfileValidationResult<TrainerInfoValidationErrors> {
  const errors: TrainerInfoValidationErrors = {}

  const name = payload.name.trim()
  if (!name) errors.name = 'required'
  else if (name.length < 2) errors.name = 'tooShort'

  const contactPhone = payload.contactPhone.trim()
  if (!contactPhone) errors.contactPhone = 'required'
  else {
    const digits = countPhoneDigits(contactPhone)
    if (digits < 10 || digits > 11) errors.contactPhone = 'invalid'
  }

  if (!payload.profession.trim()) errors.profession = 'required'

  const description = payload.description.trim()
  if (!description) errors.description = 'required'
  else if (description.length < 20) errors.description = 'tooShort'

  if (!payload.specialties.length) errors.specialties = 'required'
  else if (
    payload.specialties.some(
      (s) => !CATALOG_SPECIALTIES.includes(s as (typeof CATALOG_SPECIALTIES)[number]),
    )
  ) {
    errors.specialties = 'invalid'
  }

  if (!payload.modalities.length) errors.modalities = 'required'
  else if (payload.modalities.some((m) => !CATALOG_MODALITIES.includes(m))) {
    errors.modalities = 'invalid'
  }

  if (!payload.city.trim()) errors.city = 'required'

  const state = payload.state.trim().toUpperCase()
  if (!state) errors.state = 'required'
  else if (!BRAZILIAN_STATES.has(state)) errors.state = 'invalid'

  if (!Number.isFinite(payload.servicePrice) || payload.servicePrice <= 0) {
    errors.servicePrice = 'invalid'
  }

  if (!payload.cref.trim()) errors.cref = 'required'
  if (!payload.availability.trim()) errors.availability = 'required'

  if (
    !Number.isFinite(payload.experienceYears) ||
    payload.experienceYears < 0 ||
    payload.experienceYears > 60
  ) {
    errors.experienceYears = 'invalid'
  }

  return { valid: Object.keys(errors).length === 0, errors }
}

export function validateTrainerPromotion(
  payload: TrainerPromotionPayload,
  servicePrice: number,
): TrainerProfileValidationResult<TrainerPromotionValidationErrors> {
  const errors: TrainerPromotionValidationErrors = {}

  if (!payload.active) return { valid: true, errors }

  if (
    !Number.isFinite(payload.discountPercent) ||
    payload.discountPercent < 5 ||
    payload.discountPercent > 80
  ) {
    errors.discountPercent = 'invalid'
  }

  if (!payload.label.trim()) errors.label = 'required'

  if (!payload.startsAt) errors.startsAt = 'required'
  else if (!isValidDateString(payload.startsAt)) errors.startsAt = 'invalid'

  if (!payload.endsAt) errors.endsAt = 'required'
  else if (!isValidDateString(payload.endsAt)) errors.endsAt = 'invalid'
  else if (
    payload.startsAt &&
    isValidDateString(payload.startsAt) &&
    payload.endsAt < payload.startsAt
  ) {
    errors.endsAt = 'beforeStart'
  }

  if (payload.maxRedemptions != null) {
    if (!Number.isInteger(payload.maxRedemptions) || payload.maxRedemptions < 1) {
      errors.maxRedemptions = 'invalid'
    }
  }

  if (servicePrice <= 0) errors.active = 'noServicePrice'

  return { valid: Object.keys(errors).length === 0, errors }
}
