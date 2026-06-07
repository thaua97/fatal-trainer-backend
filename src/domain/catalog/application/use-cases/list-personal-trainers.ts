import type { ListQuery } from '../../enterprise/value-objects/list-query'
import { FilterPipeline } from '../../enterprise/strategies/filter/filter-pipeline'
import { sortTrainers } from '../../enterprise/strategies/sort/sort-strategies'
import type {
  PaginatedTrainersResult,
  PersonalTrainersRepository,
} from '../repositories/personal-trainers-repository'

export class ListPersonalTrainersUseCase {
  constructor(
    private readonly trainersRepository: PersonalTrainersRepository,
    private readonly filterPipeline = new FilterPipeline(),
  ) {}

  async execute(query: ListQuery): Promise<PaginatedTrainersResult> {
    const trainers = await this.trainersRepository.findAll()
    const filtered = this.filterPipeline.apply(trainers, query)
    const sorted = sortTrainers(filtered, query)
    const start = (query.page - 1) * query.pageSize
    const items = sorted.slice(start, start + query.pageSize)

    return {
      items,
      total: sorted.length,
      page: query.page,
      pageSize: query.pageSize,
      hasMore: query.page * query.pageSize < sorted.length,
    }
  }
}
