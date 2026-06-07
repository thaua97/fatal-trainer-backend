import type { PersonalTrainer } from '../../entities/personal-trainer'
import type { ListQuery, SortBy } from '../../value-objects/list-query'
import { getDiscountPercent, getEffectivePrice } from '../../services/trainer-pricing'

export interface SortTrainerStrategy {
  getSortValue(trainer: PersonalTrainer, query: ListQuery): number | string
}

class PriceSortStrategy implements SortTrainerStrategy {
  getSortValue(trainer: PersonalTrainer): number {
    return getEffectivePrice(trainer)
  }
}

class RatingSortStrategy implements SortTrainerStrategy {
  getSortValue(trainer: PersonalTrainer): number {
    return trainer.props.rating ?? 0
  }
}

class DistanceSortStrategy implements SortTrainerStrategy {
  getSortValue(trainer: PersonalTrainer): number {
    return trainer.props.distanceKm ?? Number.MAX_SAFE_INTEGER
  }
}

class NameSortStrategy implements SortTrainerStrategy {
  getSortValue(trainer: PersonalTrainer): string {
    return trainer.props.name.toLowerCase()
  }
}

class ReviewCountSortStrategy implements SortTrainerStrategy {
  getSortValue(trainer: PersonalTrainer): number {
    return trainer.props.reviewCount ?? 0
  }
}

class ExperienceYearsSortStrategy implements SortTrainerStrategy {
  getSortValue(trainer: PersonalTrainer): number {
    return trainer.props.experienceYears ?? 0
  }
}

class DiscountSortStrategy implements SortTrainerStrategy {
  getSortValue(trainer: PersonalTrainer): number {
    return getDiscountPercent(trainer) ?? -1
  }
}

export class SortStrategyFactory {
  static create(sortBy: SortBy): SortTrainerStrategy {
    switch (sortBy) {
      case 'price':
        return new PriceSortStrategy()
      case 'rating':
        return new RatingSortStrategy()
      case 'distance':
        return new DistanceSortStrategy()
      case 'name':
        return new NameSortStrategy()
      case 'reviewCount':
        return new ReviewCountSortStrategy()
      case 'experienceYears':
        return new ExperienceYearsSortStrategy()
      case 'discount':
        return new DiscountSortStrategy()
    }
  }
}

export function sortTrainers(
  trainers: PersonalTrainer[],
  query: ListQuery,
): PersonalTrainer[] {
  const strategy = SortStrategyFactory.create(query.sortBy)

  return [...trainers].sort((a, b) => {
    const aValue = strategy.getSortValue(a, query)
    const bValue = strategy.getSortValue(b, query)

    if (aValue === bValue) return 0
    const result = aValue < bValue ? -1 : 1
    return query.sortOrder === 'asc' ? result : -result
  })
}
