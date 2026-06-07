import type { PersonalTrainer } from '../../enterprise/entities/personal-trainer'
import type { PersonalTrainersRepository } from '../repositories/personal-trainers-repository'

export class ListFeaturedTrainersUseCase {
  constructor(private readonly trainersRepository: PersonalTrainersRepository) {}

  async execute(limit = 6): Promise<PersonalTrainer[]> {
    return this.trainersRepository.findFeatured(limit)
  }
}
