import type { PersonalTrainer } from '../../entities/personal-trainer'
import type { ListQuery } from '../../value-objects/list-query'

export interface TrainerFilterStrategy {
  matches(trainer: PersonalTrainer, query: ListQuery): boolean
}
