import type { PersonalTrainer } from '../entities/personal-trainer'
import type { PriceView } from '../value-objects/list-query'
import { DEFAULT_PRICE_VIEW } from '../value-objects/list-query'
import { SESSIONS_PER_MONTH } from '../constants/catalog-options'

function todayIsoDate(): string {
  return new Date().toISOString().slice(0, 10)
}

function isWithinPromotionPeriod(
  promotion: NonNullable<PersonalTrainer['props']['promotion']>,
  referenceDate = todayIsoDate(),
): boolean {
  if (promotion.startsAt && referenceDate < promotion.startsAt) return false
  if (promotion.endsAt && referenceDate > promotion.endsAt) return false
  return true
}

function hasRedemptionsAvailable(
  promotion: NonNullable<PersonalTrainer['props']['promotion']>,
): boolean {
  if (promotion.maxRedemptions == null) return true
  return (promotion.redemptionCount ?? 0) < promotion.maxRedemptions
}

export function computePromoPrice(servicePrice: number, discountPercent: number): number {
  const clamped = Math.min(80, Math.max(5, discountPercent))
  return Math.round(servicePrice * (1 - clamped / 100))
}

export function computeDiscountPercent(servicePrice: number, promoPrice: number): number | null {
  if (servicePrice <= 0) return null
  const discount = Math.round(((servicePrice - promoPrice) / servicePrice) * 100)
  return discount > 0 ? discount : null
}

export function isOnPromotion(trainer: PersonalTrainer, referenceDate = todayIsoDate()): boolean {
  const promotion = trainer.props.promotion
  if (!promotion) return false
  if (!isWithinPromotionPeriod(promotion, referenceDate)) return false
  return hasRedemptionsAvailable(promotion)
}

export function convertPriceForView(
  price: number,
  priceView: PriceView = DEFAULT_PRICE_VIEW,
): number {
  return priceView === 'monthly' ? price * SESSIONS_PER_MONTH : price
}

export function getEffectivePrice(trainer: PersonalTrainer, referenceDate = todayIsoDate()): number {
  if (!isOnPromotion(trainer, referenceDate)) {
    return trainer.props.servicePrice
  }
  return trainer.props.promotion!.promoPrice
}

export function getDisplayPrice(
  trainer: PersonalTrainer,
  priceView: PriceView = DEFAULT_PRICE_VIEW,
  referenceDate = todayIsoDate(),
): number {
  return convertPriceForView(getEffectivePrice(trainer, referenceDate), priceView)
}

export function getDisplayServicePrice(
  trainer: PersonalTrainer,
  priceView: PriceView = DEFAULT_PRICE_VIEW,
): number {
  return convertPriceForView(trainer.props.servicePrice, priceView)
}

export function getDisplayPromoPrice(
  trainer: PersonalTrainer,
  priceView: PriceView = DEFAULT_PRICE_VIEW,
  referenceDate = todayIsoDate(),
): number | undefined {
  if (!isOnPromotion(trainer, referenceDate)) {
    return undefined
  }

  return convertPriceForView(trainer.props.promotion!.promoPrice, priceView)
}

export function getDiscountPercent(trainer: PersonalTrainer): number | null {
  const promotion = trainer.props.promotion
  if (!promotion) return null
  if (promotion.discountPercent != null && promotion.discountPercent > 0) {
    return promotion.discountPercent
  }
  return computeDiscountPercent(trainer.props.servicePrice, promotion.promoPrice)
}
