import type { PersonalTrainer } from '@/domain/catalog/enterprise/entities/personal-trainer'
import type { PaginatedTrainersResult } from '@/domain/catalog/application/repositories/personal-trainers-repository'

export function presentTrainer(trainer: PersonalTrainer) {
  return trainer.toJSON()
}

export function presentPaginatedTrainers(result: PaginatedTrainersResult) {
  return {
    items: result.items.map(presentTrainer),
    total: result.total,
    page: result.page,
    pageSize: result.pageSize,
    hasMore: result.hasMore,
  }
}

export function presentTrainerDetail(trainer: PersonalTrainer) {
  return { trainer: presentTrainer(trainer) }
}

export function presentFeaturedTrainers(trainers: PersonalTrainer[]) {
  return { items: trainers.map(presentTrainer) }
}
