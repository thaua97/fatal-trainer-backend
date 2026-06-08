import { ValidationError } from '@/domain/shared/errors/domain-errors'
import {
  validateTrainerInfo,
  validateTrainerPromotionActivation,
} from '../../enterprise/services/validate-trainer-profile'
import type { PersonalTrainer } from '../../enterprise/entities/personal-trainer'
import type {
  TrainerInfoPayload,
  TrainerPromotionActivationPayload,
} from '../../enterprise/entities/trainer-profile-payloads'
import type { PromotionTemplatesRepository } from '@/domain/admin/application/repositories/promotion-templates-repository'
import { ResourceNotFoundError } from '@/domain/shared/errors/domain-errors'
import type { UsersRepository } from '@/domain/auth/application/repositories/users-repository'
import type { PersonalTrainersRepository } from '../repositories/personal-trainers-repository'

interface UpdateMyTrainerRequest {
  trainerId: string
  section: 'info' | 'promotion'
  info?: TrainerInfoPayload
  promotion?: TrainerPromotionActivationPayload
}

export class UpdateMyTrainerUseCase {
  constructor(
    private readonly trainersRepository: PersonalTrainersRepository,
    private readonly usersRepository: UsersRepository,
    private readonly promotionTemplatesRepository: PromotionTemplatesRepository,
  ) {}

  async execute(request: UpdateMyTrainerRequest): Promise<PersonalTrainer> {
    const trainer = await this.trainersRepository.findById(request.trainerId)

    if (!trainer) {
      throw new ResourceNotFoundError()
    }

    if (request.section === 'info') {
      if (!request.info) {
        throw new ValidationError({ info: 'required' })
      }

      const validation = validateTrainerInfo(request.info)
      if (!validation.valid) {
        throw new ValidationError(validation.errors)
      }

      const updated = await this.trainersRepository.updateInfo(request.trainerId, request.info)

      if (updated.props.userId) {
        await this.usersRepository.update(updated.props.userId, {
          phoneNumber: request.info.contactPhone.trim(),
          name: request.info.name.trim(),
          avatarUrl: updated.props.photoUrl,
          city: request.info.city.trim(),
          state: request.info.state.trim().toUpperCase(),
        })
      }

      return updated
    }

    if (!request.promotion) {
      throw new ValidationError({ promotion: 'required' })
    }

    const validation = validateTrainerPromotionActivation(
      request.promotion,
      trainer.props.servicePrice,
    )

    if (!validation.valid) {
      throw new ValidationError(validation.errors)
    }

    if (request.promotion.templateId) {
      const template = await this.promotionTemplatesRepository.findById(
        request.promotion.templateId,
      )

      if (!template || !template.isActive) {
        throw new ResourceNotFoundError('Promotion template not found')
      }

      const today = new Date().toISOString().slice(0, 10)
      if (template.endsAt < today) {
        throw new ValidationError({ templateId: 'expired' })
      }
    }

    return this.trainersRepository.updatePromotion(request.trainerId, request.promotion)
  }
}
