import type { PersonalTrainer } from '../../entities/personal-trainer'
import type { ListQuery } from '../../value-objects/list-query'
import { normalizeSearch } from '../../services/normalize-search'
import { getDisplayPrice, isOnPromotion } from '../../services/trainer-pricing'
import type { TrainerFilterStrategy } from './trainer-filter-strategy'

export class SearchFilterStrategy implements TrainerFilterStrategy {
  matches(trainer: PersonalTrainer, query: ListQuery): boolean {
    if (!query.search?.trim()) return true

    const term = normalizeSearch(query.search)
    const name = normalizeSearch(trainer.props.name)
    const profession = normalizeSearch(trainer.props.profession)
    const specialties = (trainer.props.specialties ?? [])
      .map((specialty) => normalizeSearch(specialty))
      .join(' ')

    return name.includes(term) || profession.includes(term) || specialties.includes(term)
  }
}

export class SpecialtiesFilterStrategy implements TrainerFilterStrategy {
  matches(trainer: PersonalTrainer, query: ListQuery): boolean {
    const specialties = query.specialties ?? []
    if (!specialties.length) return true

    const trainerSpecialties = trainer.props.specialties ?? []
    return specialties.some((specialty) => trainerSpecialties.includes(specialty))
  }
}

export class ModalitiesFilterStrategy implements TrainerFilterStrategy {
  matches(trainer: PersonalTrainer, query: ListQuery): boolean {
    const modalities = query.modalities ?? []
    if (!modalities.length) return true

    const trainerModalities = trainer.props.modalities ?? []
    return modalities.some((modality) =>
      trainerModalities.includes(modality as NonNullable<typeof trainerModalities>[number]),
    )
  }
}

export class CityFilterStrategy implements TrainerFilterStrategy {
  matches(trainer: PersonalTrainer, query: ListQuery): boolean {
    if (!query.city?.trim()) return true
    return normalizeSearch(trainer.props.city ?? '') === normalizeSearch(query.city)
  }
}

export class PromotionFilterStrategy implements TrainerFilterStrategy {
  matches(trainer: PersonalTrainer, query: ListQuery): boolean {
    if (query.onPromotion !== true) return true
    return isOnPromotion(trainer)
  }
}

export class PriceRangeFilterStrategy implements TrainerFilterStrategy {
  matches(trainer: PersonalTrainer, query: ListQuery): boolean {
    const price = getDisplayPrice(trainer, query.priceView)

    if (query.minPrice != null && price < query.minPrice) return false
    if (query.maxPrice != null && price > query.maxPrice) return false
    return true
  }
}

export class MinRatingFilterStrategy implements TrainerFilterStrategy {
  matches(trainer: PersonalTrainer, query: ListQuery): boolean {
    if (query.minRating == null) return true
    return (trainer.props.rating ?? 0) >= query.minRating
  }
}

export class MaxDistanceFilterStrategy implements TrainerFilterStrategy {
  matches(trainer: PersonalTrainer, query: ListQuery): boolean {
    if (query.maxDistanceKm == null) return true
    const distance = trainer.props.distanceKm
    if (distance == null) return false
    return distance <= query.maxDistanceKm
  }
}

export const DEFAULT_FILTER_STRATEGIES: TrainerFilterStrategy[] = [
  new SearchFilterStrategy(),
  new SpecialtiesFilterStrategy(),
  new ModalitiesFilterStrategy(),
  new CityFilterStrategy(),
  new PromotionFilterStrategy(),
  new PriceRangeFilterStrategy(),
  new MinRatingFilterStrategy(),
  new MaxDistanceFilterStrategy(),
]
