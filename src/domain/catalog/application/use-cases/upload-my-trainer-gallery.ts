import { ResourceNotFoundError, ValidationError } from '@/domain/shared/errors/domain-errors'
import type { PersonalTrainer } from '../../enterprise/entities/personal-trainer'
import type { PersonalTrainersRepository } from '../repositories/personal-trainers-repository'
import type { FileStorage, GalleryUploadFile } from '../storage/file-storage'
import { assertGalleryHasCapacity, validateGalleryUploadFile } from '../../enterprise/services/gallery-upload-validator'
import type { UploadGalleryImageUseCase } from './gallery-use-cases'

export class UploadMyTrainerGalleryUseCase {
  constructor(
    private readonly trainersRepository: PersonalTrainersRepository,
    private readonly fileStorage: FileStorage,
    private readonly uploadGalleryImage: UploadGalleryImageUseCase,
  ) {}

  async execute(userId: string, file: GalleryUploadFile, truncated: boolean): Promise<{
    trainer: PersonalTrainer
    url: string
  }> {
    const trainer = await this.trainersRepository.findByUserId(userId)

    if (!trainer) {
      throw new ResourceNotFoundError()
    }

    assertGalleryHasCapacity(trainer.props.gallery?.length ?? 0)
    validateGalleryUploadFile(file)

    const url = await this.fileStorage.saveGalleryImage(trainer.id, file)

    if (truncated) {
      try {
        await this.fileStorage.deleteGalleryImage(url)
      } catch {
        // best-effort cleanup after oversize upload
      }
      throw new ValidationError({ file: 'tooLarge' })
    }

    const updated = await this.uploadGalleryImage.execute(trainer.id, url)
    return { trainer: updated, url }
  }
}
