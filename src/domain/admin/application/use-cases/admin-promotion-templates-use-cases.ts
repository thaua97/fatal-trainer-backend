import {
  ConflictError,
  ResourceNotFoundError,
  ValidationError,
} from '@/domain/shared/errors/domain-errors'
import {
  validateCreatePromotionTemplate,
  validateUpdatePromotionTemplate,
} from '@/domain/catalog/enterprise/services/validate-promotion-template'
import type { PromotionTemplatesRepository } from '../repositories/promotion-templates-repository'
import type {
  AdminPromotionListQuery,
  CreatePromotionTemplatePayload,
  UpdatePromotionTemplatePayload,
} from '../../enterprise/entities/admin-promotion-template'

export class ListPromotionTemplatesUseCase {
  constructor(private readonly repository: PromotionTemplatesRepository) {}

  execute(query: AdminPromotionListQuery) {
    return this.repository.findMany(query)
  }
}

export class GetPromotionTemplateUseCase {
  constructor(private readonly repository: PromotionTemplatesRepository) {}

  async execute(id: string) {
    const template = await this.repository.findById(id)
    if (!template) throw new ResourceNotFoundError()

    const activationCount = await this.repository.countActivations(id)
    return { ...template, activationCount }
  }
}

export class CreatePromotionTemplateUseCase {
  constructor(private readonly repository: PromotionTemplatesRepository) {}

  async execute(payload: CreatePromotionTemplatePayload) {
    const validation = validateCreatePromotionTemplate(payload)
    if (!validation.valid) throw new ValidationError(validation.errors)

    return this.repository.create(payload)
  }
}

export class UpdatePromotionTemplateUseCase {
  constructor(private readonly repository: PromotionTemplatesRepository) {}

  async execute(id: string, payload: UpdatePromotionTemplatePayload) {
    const current = await this.repository.findById(id)
    if (!current) throw new ResourceNotFoundError()

    const validation = validateUpdatePromotionTemplate(payload, current)
    if (!validation.valid) throw new ValidationError(validation.errors)

    return this.repository.update(id, payload)
  }
}

export class DeletePromotionTemplateUseCase {
  constructor(private readonly repository: PromotionTemplatesRepository) {}

  async execute(id: string) {
    const current = await this.repository.findById(id)
    if (!current) throw new ResourceNotFoundError()

    const activationCount = await this.repository.countActivations(id)
    if (activationCount > 0) {
      throw new ConflictError('Promotion template has active trainer activations')
    }

    await this.repository.delete(id)
  }
}

export class ListAvailablePromotionTemplatesUseCase {
  constructor(private readonly repository: PromotionTemplatesRepository) {}

  execute() {
    return this.repository.findAvailableForTrainer()
  }
}
