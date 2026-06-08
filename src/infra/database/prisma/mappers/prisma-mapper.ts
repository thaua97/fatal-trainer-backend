import { Prisma } from '@prisma/client'
import type { PersonalTrainer as PrismaTrainer, User as PrismaUser } from '@prisma/client'
import {
  PersonalTrainer,
  type PersonalTrainerProps,
  type TrainerModality,
  type TrainerPromotion,
  type TrainerReview,
} from '@/domain/catalog/enterprise/entities/personal-trainer'
import type { StoredUser, UserRole } from '@/domain/auth/enterprise/entities/user'
import { UserRole as PrismaUserRole } from '@prisma/client'

function mapRoleFromPrisma(role: PrismaUserRole): UserRole {
  if (role === PrismaUserRole.personal_trainer) return 'personal-trainer'
  if (role === PrismaUserRole.admin) return 'admin'
  return 'student'
}

function mapRoleToPrisma(role: UserRole): PrismaUserRole {
  if (role === 'personal-trainer') return PrismaUserRole.personal_trainer
  if (role === 'admin') return PrismaUserRole.admin
  return PrismaUserRole.student
}

export function mapUserToDomain(user: PrismaUser): StoredUser {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: mapRoleFromPrisma(user.role),
    passwordHash: user.password_hash,
    phoneNumber: user.phone_number ?? undefined,
    avatarUrl: user.avatar_url ?? undefined,
    city: user.city ?? undefined,
    state: user.state ?? undefined,
    isActive: user.is_active,
    createdAt: user.created_at.toISOString(),
  }
}

export function mapRoleToPrismaEnum(role: UserRole): PrismaUserRole {
  return mapRoleToPrisma(role)
}

export function mapTrainerToDomain(
  record: PrismaTrainer,
  options?: { isActive?: boolean },
): PersonalTrainer {
  const props: PersonalTrainerProps = {
    userId: record.user_id ?? undefined,
    name: record.name,
    profession: record.profession,
    description: record.description,
    photoUrl: record.photo_url,
    servicePrice: record.service_price,
    contactPhone: record.contact_phone ?? undefined,
    rating: record.rating ?? undefined,
    reviewCount: record.review_count ?? undefined,
    distanceKm: record.distance_km ?? undefined,
    city: record.city ?? undefined,
    state: record.state ?? undefined,
    specialties: record.specialties,
    modalities: record.modalities as TrainerModality[],
    cref: record.cref ?? undefined,
    gallery: record.gallery,
    availability: record.availability ?? undefined,
    experienceYears: record.experience_years ?? undefined,
    reviews: (record.reviews as TrainerReview[] | null) ?? undefined,
    featured: record.featured,
    promotion: (record.promotion as TrainerPromotion | null) ?? undefined,
    isActive: options?.isActive ?? true,
  }

  return PersonalTrainer.restore(record.id, props)
}

export function mapTrainerToPrisma(trainer: PersonalTrainer) {
  return {
    id: trainer.id,
    user_id: trainer.props.userId ?? null,
    name: trainer.props.name,
    profession: trainer.props.profession,
    description: trainer.props.description,
    photo_url: trainer.props.photoUrl,
    service_price: trainer.props.servicePrice,
    contact_phone: trainer.props.contactPhone ?? null,
    rating: trainer.props.rating ?? null,
    review_count: trainer.props.reviewCount ?? null,
    distance_km: trainer.props.distanceKm ?? null,
    city: trainer.props.city ?? null,
    state: trainer.props.state ?? null,
    specialties: trainer.props.specialties ?? [],
    modalities: trainer.props.modalities ?? [],
    cref: trainer.props.cref ?? null,
    gallery: trainer.props.gallery ?? [],
    availability: trainer.props.availability ?? null,
    experience_years: trainer.props.experienceYears ?? null,
    reviews: trainer.props.reviews
      ? (trainer.props.reviews as unknown as Prisma.InputJsonValue)
      : Prisma.JsonNull,
    featured: trainer.props.featured ?? false,
    promotion: trainer.props.promotion
      ? (trainer.props.promotion as unknown as Prisma.InputJsonValue)
      : Prisma.JsonNull,
  }
}
