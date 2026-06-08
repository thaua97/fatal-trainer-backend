import { ResourceNotFoundError } from '@/domain/shared/errors/domain-errors'
import type { PersonalTrainer } from '../../enterprise/entities/personal-trainer'
import type { PersonalTrainersRepository } from '../repositories/personal-trainers-repository'

export class ResolveMyTrainerUseCase {
  constructor(private readonly trainersRepository: PersonalTrainersRepository) {}

  async execute(userId: string): Promise<PersonalTrainer> {
    const trainer = await this.trainersRepository.findByUserId(userId)

    if (!trainer) {
      throw new ResourceNotFoundError()
    }

    return trainer
  }
}
