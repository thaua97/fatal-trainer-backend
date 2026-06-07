import { ResourceNotFoundError } from '@/domain/shared/errors/domain-errors'
import type { PersonalTrainer } from '../../enterprise/entities/personal-trainer'
import type { PersonalTrainersRepository } from '../repositories/personal-trainers-repository'

export class GetPersonalTrainerByIdUseCase {
  constructor(private readonly trainersRepository: PersonalTrainersRepository) {}

  async execute(id: string): Promise<PersonalTrainer> {
    const trainer = await this.trainersRepository.findById(id)

    if (!trainer) {
      throw new ResourceNotFoundError('Personal trainer not found')
    }

    return trainer
  }
}
