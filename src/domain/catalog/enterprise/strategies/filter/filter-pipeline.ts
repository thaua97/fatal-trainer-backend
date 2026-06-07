import type { PersonalTrainer } from '../../entities/personal-trainer'
import type { ListQuery } from '../../value-objects/list-query'
import type { TrainerFilterStrategy } from './trainer-filter-strategy'
import { DEFAULT_FILTER_STRATEGIES } from './filter-strategies'

export class FilterPipeline {
  constructor(private readonly strategies: TrainerFilterStrategy[] = DEFAULT_FILTER_STRATEGIES) {}

  apply(trainers: PersonalTrainer[], query: ListQuery): PersonalTrainer[] {
    return trainers.filter((trainer) =>
      this.strategies.every((strategy) => strategy.matches(trainer, query)),
    )
  }
}
