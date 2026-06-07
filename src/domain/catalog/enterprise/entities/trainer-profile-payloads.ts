import type { TrainerModality } from '@/domain/catalog/enterprise/entities/personal-trainer'

export interface TrainerInfoPayload {
  name: string
  contactPhone: string
  profession: string
  description: string
  specialties: string[]
  modalities: TrainerModality[]
  city: string
  state: string
  servicePrice: number
  cref: string
  availability: string
  experienceYears: number
}

export interface TrainerPromotionPayload {
  active: boolean
  discountPercent: number
  label: string
  startsAt: string
  endsAt: string
  maxRedemptions: number | null
}

export type TrainerInfoValidationErrors = Partial<Record<keyof TrainerInfoPayload, string>>
export type TrainerPromotionValidationErrors = Partial<
  Record<keyof TrainerPromotionPayload | 'active', string>
>

export interface TrainerProfileValidationResult<T> {
  valid: boolean
  errors: T
}
