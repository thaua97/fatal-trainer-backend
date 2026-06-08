import { Prisma } from '@prisma/client'
import { ResourceNotFoundError, ValidationError } from '@/domain/shared/errors/domain-errors'
import type { PersonalTrainer as PrismaTrainer } from '@prisma/client'
import { prisma } from '@/libs/prisma'
import type { PersonalTrainer } from '@/domain/catalog/enterprise/entities/personal-trainer'
import type { TrainerInfoPayload } from '@/domain/catalog/enterprise/entities/trainer-profile-payloads'
import type { TrainerPromotionActivationPayload } from '@/domain/catalog/enterprise/entities/trainer-profile-payloads'
import type { PersonalTrainersRepository } from '@/domain/catalog/application/repositories/personal-trainers-repository'
import { isPromotionRef } from '@/domain/catalog/enterprise/services/promotion-hydration'
import { mapTrainerToDomain, mapTrainerToPrisma } from '../mappers/prisma-mapper'
import { PrismaPromotionTemplatesRepository } from './prisma-promotion-templates-repository'

export class PrismaPersonalTrainersRepository implements PersonalTrainersRepository {
  private readonly templatesRepository = new PrismaPromotionTemplatesRepository()

  private collectTemplateIds(records: PrismaTrainer[]): string[] {
    const ids = new Set<string>()

    for (const record of records) {
      if (isPromotionRef(record.promotion)) {
        ids.add(record.promotion.templateId)
      }
    }

    return [...ids]
  }

  private async buildTemplatesMap(records: PrismaTrainer[]) {
    const templateIds = this.collectTemplateIds(records)
    const templates = await this.templatesRepository.findByIds(templateIds)
    return new Map(templates.map((template) => [template.id, template]))
  }

  private async mapRecords(records: PrismaTrainer[]): Promise<PersonalTrainer[]> {
    const templatesById = await this.buildTemplatesMap(records)
    return records.map((record) => mapTrainerToDomain(record, { templatesById }))
  }

  private async mapRecord(
    record: PrismaTrainer,
    options?: { isActive?: boolean },
  ): Promise<PersonalTrainer> {
    const templatesById = await this.buildTemplatesMap([record])
    return mapTrainerToDomain(record, { ...options, templatesById })
  }

  async findAll(): Promise<PersonalTrainer[]> {
    const records = await prisma.personalTrainer.findMany()
    return this.mapRecords(records)
  }

  async findById(id: string): Promise<PersonalTrainer | null> {
    const record = await prisma.personalTrainer.findUnique({
      where: { id },
      include: {
        user: {
          select: { is_active: true },
        },
      },
    })

    return record
      ? this.mapRecord(record, { isActive: record.user?.is_active ?? true })
      : null
  }

  async findByUserId(userId: string): Promise<PersonalTrainer | null> {
    const record = await prisma.personalTrainer.findUnique({ where: { user_id: userId } })
    return record ? this.mapRecord(record) : null
  }

  async findByIds(ids: string[]): Promise<PersonalTrainer[]> {
    if (!ids.length) return []

    const records = await prisma.personalTrainer.findMany({
      where: { id: { in: ids } },
    })

    const mapped = await this.mapRecords(records)
    const byId = new Map(mapped.map((trainer) => [trainer.id, trainer]))
    return ids.map((id) => byId.get(id)).filter((trainer): trainer is PersonalTrainer => Boolean(trainer))
  }

  async findFeatured(limit: number): Promise<PersonalTrainer[]> {
    const records = await prisma.personalTrainer.findMany({
      where: { featured: true },
      orderBy: { rating: 'desc' },
      take: limit,
    })

    return this.mapRecords(records)
  }

  async create(trainer: PersonalTrainer): Promise<void> {
    await prisma.personalTrainer.create({ data: mapTrainerToPrisma(trainer) })
  }

  async save(trainer: PersonalTrainer): Promise<void> {
    await prisma.personalTrainer.update({
      where: { id: trainer.id },
      data: mapTrainerToPrisma(trainer),
    })
  }

  async updateInfo(trainerId: string, payload: TrainerInfoPayload): Promise<PersonalTrainer> {
    const current = await prisma.personalTrainer.findUnique({ where: { id: trainerId } })
    if (!current) throw new ResourceNotFoundError()

    const record = await prisma.personalTrainer.update({
      where: { id: trainerId },
      data: {
        name: payload.name.trim(),
        contact_phone: payload.contactPhone.trim(),
        profession: payload.profession.trim(),
        description: payload.description.trim(),
        specialties: payload.specialties,
        modalities: payload.modalities,
        city: payload.city.trim(),
        state: payload.state.trim().toUpperCase(),
        service_price: payload.servicePrice,
        cref: payload.cref.trim(),
        availability: payload.availability.trim(),
        experience_years: payload.experienceYears,
      },
    })

    return this.mapRecord(record)
  }

  async updatePromotion(
    trainerId: string,
    payload: TrainerPromotionActivationPayload,
  ): Promise<PersonalTrainer> {
    const current = await prisma.personalTrainer.findUnique({ where: { id: trainerId } })
    if (!current) throw new ResourceNotFoundError()

    let promotion: Prisma.InputJsonValue | typeof Prisma.JsonNull = Prisma.JsonNull

    if (payload.templateId) {
      const template = await this.templatesRepository.findById(payload.templateId)
      if (!template || !template.isActive) {
        throw new ResourceNotFoundError()
      }

      const existingRef = isPromotionRef(current.promotion) ? current.promotion : null
      const redemptionCount =
        existingRef?.templateId === payload.templateId
          ? (existingRef.redemptionCount ?? 0)
          : 0

      promotion = {
        templateId: payload.templateId,
        redemptionCount,
      }
    }

    const record = await prisma.personalTrainer.update({
      where: { id: trainerId },
      data: { promotion },
    })

    return this.mapRecord(record)
  }

  async addGalleryImage(trainerId: string, imageUrl: string): Promise<PersonalTrainer> {
    const current = await prisma.personalTrainer.findUnique({ where: { id: trainerId } })
    if (!current) throw new ResourceNotFoundError()

    const gallery = [...((current.gallery as string[] | null) ?? []), imageUrl]
    const photoUrl = current.photo_url || imageUrl

    const record = await prisma.personalTrainer.update({
      where: { id: trainerId },
      data: { gallery, photo_url: photoUrl },
    })

    return this.mapRecord(record)
  }

  async removeGalleryImage(trainerId: string, imageIndex: number): Promise<PersonalTrainer> {
    const current = await prisma.personalTrainer.findUnique({ where: { id: trainerId } })
    if (!current) throw new ResourceNotFoundError()

    const gallery = [...((current.gallery as string[] | null) ?? [])]
    if (imageIndex < 0 || imageIndex >= gallery.length) {
      throw new ValidationError({ gallery: 'notFound' })
    }

    const [removedUrl] = gallery.splice(imageIndex, 1)
    const photoUrl =
      current.photo_url === removedUrl
        ? (gallery[0] ?? current.photo_url)
        : current.photo_url

    const record = await prisma.personalTrainer.update({
      where: { id: trainerId },
      data: { gallery, photo_url: photoUrl },
    })

    return this.mapRecord(record)
  }

  async setCoverPhoto(trainerId: string, imageUrl: string): Promise<PersonalTrainer> {
    const current = await prisma.personalTrainer.findUnique({ where: { id: trainerId } })
    if (!current) throw new ResourceNotFoundError()

    const gallery = (current.gallery as string[] | null) ?? []
    if (!gallery.includes(imageUrl)) {
      throw new ValidationError({ gallery: 'notFound' })
    }

    const record = await prisma.personalTrainer.update({
      where: { id: trainerId },
      data: { photo_url: imageUrl },
    })

    if (current.user_id) {
      await prisma.user.update({
        where: { id: current.user_id },
        data: { avatar_url: imageUrl },
      })
    }

    return this.mapRecord(record)
  }
}
