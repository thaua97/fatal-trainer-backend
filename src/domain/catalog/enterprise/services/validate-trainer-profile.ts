import {
  CATALOG_MODALITIES,
  CATALOG_SPECIALTIES,
} from '../constants/catalog-options'
import type {
  TrainerInfoPayload,
  TrainerInfoValidationErrors,
  TrainerProfileValidationResult,
  TrainerPromotionActivationPayload,
  TrainerPromotionValidationErrors,
} from '../entities/trainer-profile-payloads'

const BRAZILIAN_STATES = new Set([
  'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MT', 'MS', 'MG',
  'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO',
])

function countPhoneDigits(phone: string): number {
  return phone.replace(/\D/g, '').length
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

export function validateTrainerPromotionActivation(
  payload: TrainerPromotionActivationPayload,
  servicePrice: number,
): TrainerProfileValidationResult<TrainerPromotionValidationErrors> {
  const errors: TrainerPromotionValidationErrors = {}

  if (payload.templateId === null) return { valid: true, errors }

  if (!payload.templateId?.trim()) {
    errors.templateId = 'required'
  }

  if (servicePrice <= 0) {
    errors.templateId = 'noServicePrice'
  }

  return { valid: Object.keys(errors).length === 0, errors }
}
