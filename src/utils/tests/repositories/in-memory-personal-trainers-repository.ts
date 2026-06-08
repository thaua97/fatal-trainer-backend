import type { PersonalTrainer } from '@/domain/catalog/enterprise/entities/personal-trainer'
import type {
  TrainerInfoPayload,
  TrainerPromotionActivationPayload,
} from '@/domain/catalog/enterprise/entities/trainer-profile-payloads'
import type { PersonalTrainersRepository } from '@/domain/catalog/application/repositories/personal-trainers-repository'
import { hydratePromotionFromTemplate } from '@/domain/catalog/enterprise/services/promotion-hydration'
import type { InMemoryPromotionTemplatesRepository } from './in-memory-promotion-templates-repository'

export class InMemoryPersonalTrainersRepository implements PersonalTrainersRepository {
  public items: PersonalTrainer[] = []

  constructor(
    private readonly templatesRepository?: InMemoryPromotionTemplatesRepository,
  ) {}

  async findAll(): Promise<PersonalTrainer[]> {
    return this.items
  }

  async findById(id: string): Promise<PersonalTrainer | null> {
    return this.items.find((trainer) => trainer.id === id) ?? null
  }

  async findByUserId(userId: string): Promise<PersonalTrainer | null> {
    return this.items.find((trainer) => trainer.props.userId === userId) ?? null
  }

  async findByIds(ids: string[]): Promise<PersonalTrainer[]> {
    const byId = new Map(this.items.map((trainer) => [trainer.id, trainer]))
    return ids.map((id) => byId.get(id)).filter((trainer): trainer is PersonalTrainer => Boolean(trainer))
  }

  async findFeatured(limit: number): Promise<PersonalTrainer[]> {
    return this.items
      .filter((trainer) => trainer.props.featured)
      .sort((a, b) => (b.props.rating ?? 0) - (a.props.rating ?? 0))
      .slice(0, limit)
  }

  async create(trainer: PersonalTrainer): Promise<void> {
    this.items.push(trainer)
  }

  async save(trainer: PersonalTrainer): Promise<void> {
    const index = this.items.findIndex((item) => item.id === trainer.id)
    if (index === -1) {
      this.items.push(trainer)
      return
    }
    this.items[index] = trainer
  }

  async updateInfo(trainerId: string, payload: TrainerInfoPayload): Promise<PersonalTrainer> {
    const current = await this.findById(trainerId)
    if (!current) throw new Error('Trainer not found')

    current.props = {
      ...current.props,
      name: payload.name.trim(),
      contactPhone: payload.contactPhone.trim(),
      profession: payload.profession.trim(),
      description: payload.description.trim(),
      specialties: [...payload.specialties],
      modalities: [...payload.modalities],
      city: payload.city.trim(),
      state: payload.state.trim().toUpperCase(),
      servicePrice: payload.servicePrice,
      cref: payload.cref.trim(),
      availability: payload.availability.trim(),
      experienceYears: payload.experienceYears,
    }

    return current
  }

  async updatePromotion(
    trainerId: string,
    payload: TrainerPromotionActivationPayload,
  ): Promise<PersonalTrainer> {
    const current = await this.findById(trainerId)
    if (!current) throw new Error('Trainer not found')

    if (!payload.templateId) {
      current.props.promotion = undefined
      return current
    }

    const template = await this.templatesRepository?.findById(payload.templateId)
    if (!template) throw new Error('Promotion template not found')

    const hydrated = hydratePromotionFromTemplate(
      {
        templateId: payload.templateId,
        redemptionCount:
          current.props.promotion?.templateId === payload.templateId
            ? (current.props.promotion?.redemptionCount ?? 0)
            : 0,
      },
      template,
      current.props.servicePrice,
    )

    current.props.promotion = hydrated

    return current
  }

  async addGalleryImage(trainerId: string, imageUrl: string): Promise<PersonalTrainer> {
    const current = await this.findById(trainerId)
    if (!current) throw new Error('Trainer not found')

    current.props.gallery = [...(current.props.gallery ?? []), imageUrl]
    if (!current.props.photoUrl) {
      current.props.photoUrl = imageUrl
    }

    return current
  }

  async removeGalleryImage(trainerId: string, imageIndex: number): Promise<PersonalTrainer> {
    const current = await this.findById(trainerId)
    if (!current) throw new Error('Trainer not found')

    const gallery = [...(current.props.gallery ?? [])]
    if (imageIndex < 0 || imageIndex >= gallery.length) {
      throw new Error('Image not found')
    }

    const [removedUrl] = gallery.splice(imageIndex, 1)
    current.props.gallery = gallery
    if (current.props.photoUrl === removedUrl) {
      current.props.photoUrl = gallery[0] ?? current.props.photoUrl
    }

    return current
  }

  async setCoverPhoto(trainerId: string, imageUrl: string): Promise<PersonalTrainer> {
    const current = await this.findById(trainerId)
    if (!current) throw new Error('Trainer not found')

    const gallery = current.props.gallery ?? []
    if (!gallery.includes(imageUrl)) {
      throw new Error('Image not in gallery')
    }

    current.props.photoUrl = imageUrl
    return current
  }
}
