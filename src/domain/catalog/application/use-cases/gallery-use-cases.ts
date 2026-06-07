import { ResourceNotFoundError } from '@/domain/shared/errors/domain-errors'
import type { PersonalTrainer } from '../../enterprise/entities/personal-trainer'
import type { PersonalTrainersRepository } from '../repositories/personal-trainers-repository'

export class UploadGalleryImageUseCase {
  constructor(private readonly trainersRepository: PersonalTrainersRepository) {}

  async execute(trainerId: string, imageUrl: string): Promise<PersonalTrainer> {
    const trainer = await this.trainersRepository.findById(trainerId)
    if (!trainer) {
      throw new ResourceNotFoundError('Trainer not found')
    }

    return this.trainersRepository.addGalleryImage(trainerId, imageUrl)
  }
}

export class DeleteGalleryImageUseCase {
  constructor(private readonly trainersRepository: PersonalTrainersRepository) {}

  async execute(trainerId: string, imageIndex: number): Promise<PersonalTrainer> {
    const trainer = await this.trainersRepository.findById(trainerId)
    if (!trainer) {
      throw new ResourceNotFoundError('Trainer not found')
    }

    return this.trainersRepository.removeGalleryImage(trainerId, imageIndex)
  }
}

export class SetGalleryCoverUseCase {
  constructor(private readonly trainersRepository: PersonalTrainersRepository) {}

  async execute(trainerId: string, imageUrl: string): Promise<PersonalTrainer> {
    const trainer = await this.trainersRepository.findById(trainerId)
    if (!trainer) {
      throw new ResourceNotFoundError('Trainer not found')
    }

    return this.trainersRepository.setCoverPhoto(trainerId, imageUrl)
  }
}
