import { Prisma } from '@prisma/client'
import { prisma } from '@/libs/prisma'
import type { PersonalTrainer } from '@/domain/catalog/enterprise/entities/personal-trainer'
import type {
  TrainerInfoPayload,
  TrainerPromotionPayload,
} from '@/domain/catalog/enterprise/entities/trainer-profile-payloads'
import type { PersonalTrainersRepository } from '@/domain/catalog/application/repositories/personal-trainers-repository'
import {
  computeDiscountPercent,
  computePromoPrice,
} from '@/domain/catalog/enterprise/services/trainer-pricing'
import { mapTrainerToDomain, mapTrainerToPrisma } from '../mappers/prisma-mapper'

export class PrismaPersonalTrainersRepository implements PersonalTrainersRepository {
  async findAll(): Promise<PersonalTrainer[]> {
    const records = await prisma.personalTrainer.findMany()
    return records.map(mapTrainerToDomain)
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
      ? mapTrainerToDomain(record, { isActive: record.user?.is_active ?? true })
      : null
  }

  async findByUserId(userId: string): Promise<PersonalTrainer | null> {
    const record = await prisma.personalTrainer.findUnique({ where: { user_id: userId } })
    return record ? mapTrainerToDomain(record) : null
  }

  async findByIds(ids: string[]): Promise<PersonalTrainer[]> {
    if (!ids.length) return []

    const records = await prisma.personalTrainer.findMany({
      where: { id: { in: ids } },
    })

    const byId = new Map(records.map((record) => [record.id, mapTrainerToDomain(record)]))
    return ids.map((id) => byId.get(id)).filter((trainer): trainer is PersonalTrainer => Boolean(trainer))
  }

  async findFeatured(limit: number): Promise<PersonalTrainer[]> {
    const records = await prisma.personalTrainer.findMany({
      where: { featured: true },
      orderBy: { rating: 'desc' },
      take: limit,
    })

    return records.map(mapTrainerToDomain)
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
    const current = await this.findById(trainerId)
    if (!current) throw new Error('Trainer not found')

    const promotion = current.props.promotion
      ? {
          ...current.props.promotion,
          discountPercent:
            current.props.promotion.discountPercent ??
            computeDiscountPercent(
              current.props.servicePrice,
              current.props.promotion.promoPrice,
            ) ??
            15,
          promoPrice: computePromoPrice(payload.servicePrice, 15),
        }
      : undefined

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
        promotion,
      },
    })

    return mapTrainerToDomain(record)
  }

  async updatePromotion(
    trainerId: string,
    payload: TrainerPromotionPayload,
  ): Promise<PersonalTrainer> {
    const current = await this.findById(trainerId)
    if (!current) throw new Error('Trainer not found')

    const promotion = payload.active
      ? {
          discountPercent: payload.discountPercent,
          promoPrice: computePromoPrice(current.props.servicePrice, payload.discountPercent),
          label: payload.label.trim(),
          startsAt: payload.startsAt,
          endsAt: payload.endsAt,
          maxRedemptions: payload.maxRedemptions ?? undefined,
          redemptionCount: current.props.promotion?.redemptionCount ?? 0,
        }
      : null

    const record = await prisma.personalTrainer.update({
      where: { id: trainerId },
      data: { promotion: (promotion ?? Prisma.JsonNull) as Prisma.InputJsonValue },
    })

    return mapTrainerToDomain(record)
  }

  async addGalleryImage(trainerId: string, imageUrl: string): Promise<PersonalTrainer> {
    const current = await this.findById(trainerId)
    if (!current) throw new Error('Trainer not found')

    const gallery = [...(current.props.gallery ?? []), imageUrl]
    const photoUrl = current.props.photoUrl || imageUrl

    const record = await prisma.personalTrainer.update({
      where: { id: trainerId },
      data: { gallery, photo_url: photoUrl },
    })

    return mapTrainerToDomain(record)
  }

  async removeGalleryImage(trainerId: string, imageIndex: number): Promise<PersonalTrainer> {
    const current = await this.findById(trainerId)
    if (!current) throw new Error('Trainer not found')

    const gallery = [...(current.props.gallery ?? [])]
    if (imageIndex < 0 || imageIndex >= gallery.length) {
      throw new Error('Image not found')
    }

    const [removedUrl] = gallery.splice(imageIndex, 1)
    const photoUrl =
      current.props.photoUrl === removedUrl
        ? (gallery[0] ?? current.props.photoUrl)
        : current.props.photoUrl

    const record = await prisma.personalTrainer.update({
      where: { id: trainerId },
      data: { gallery, photo_url: photoUrl },
    })

    return mapTrainerToDomain(record)
  }

  async setCoverPhoto(trainerId: string, imageUrl: string): Promise<PersonalTrainer> {
    const current = await this.findById(trainerId)
    if (!current) throw new Error('Trainer not found')

    const gallery = current.props.gallery ?? []
    if (!gallery.includes(imageUrl)) {
      throw new Error('Image not in gallery')
    }

    const record = await prisma.personalTrainer.update({
      where: { id: trainerId },
      data: { photo_url: imageUrl },
    })

    if (current.props.userId) {
      await prisma.user.update({
        where: { id: current.props.userId },
        data: { avatar_url: imageUrl },
      })
    }

    return mapTrainerToDomain(record)
  }
}
