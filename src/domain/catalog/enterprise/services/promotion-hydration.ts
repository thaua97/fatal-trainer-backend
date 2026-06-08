import type { TrainerPromotion } from '../entities/personal-trainer'
import type { PromotionTemplateRecord } from '@/domain/admin/enterprise/entities/admin-promotion-template'
import { computePromoPrice } from './trainer-pricing'

export interface TrainerPromotionRef {
  templateId: string
  redemptionCount?: number
}

export function isPromotionRef(value: unknown): value is TrainerPromotionRef {
  if (!value || typeof value !== 'object') return false
  const record = value as Record<string, unknown>
  return typeof record.templateId === 'string'
}

export function isLegacyPromotion(value: unknown): value is TrainerPromotion {
  if (!value || typeof value !== 'object') return false
  const record = value as Record<string, unknown>
  return typeof record.promoPrice === 'number' && !record.templateId
}

export function formatDateOnly(date: Date | string): string {
  if (typeof date === 'string') return date.slice(0, 10)
  return date.toISOString().slice(0, 10)
}

export function hydratePromotionFromTemplate(
  ref: TrainerPromotionRef,
  template: PromotionTemplateRecord,
  servicePrice: number,
): TrainerPromotion | undefined {
  if (!template.isActive) return undefined

  return {
    templateId: template.id,
    discountPercent: template.discountPercent,
    promoPrice: computePromoPrice(servicePrice, template.discountPercent),
    label: template.label,
    startsAt: template.startsAt,
    endsAt: template.endsAt,
    maxRedemptions: template.maxRedemptions,
    redemptionCount: ref.redemptionCount ?? 0,
  }
}

export function resolvePromotion(
  raw: unknown,
  servicePrice: number,
  templatesById: Map<string, PromotionTemplateRecord>,
): TrainerPromotion | undefined {
  if (!raw) return undefined

  if (isPromotionRef(raw)) {
    const template = templatesById.get(raw.templateId)
    if (!template) return undefined
    return hydratePromotionFromTemplate(raw, template, servicePrice)
  }

  if (isLegacyPromotion(raw)) {
    return raw
  }

  return undefined
}
