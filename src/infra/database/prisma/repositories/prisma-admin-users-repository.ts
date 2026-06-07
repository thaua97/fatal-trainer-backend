import { prisma } from '@/libs/prisma'
import { UserRole as PrismaUserRole } from '@prisma/client'
import type { UserRole } from '@/domain/auth/enterprise/entities/user'
import { PersonalTrainer } from '@/domain/catalog/enterprise/entities/personal-trainer'
import { makePersonalTrainerProps } from '@/utils/tests/factories/make-personal-trainer'
import { mapTrainerToPrisma, mapRoleToPrismaEnum } from '../mappers/prisma-mapper'
import type { AdminUsersRepository } from '@/domain/admin/application/repositories/admin-users-repository'
import type {
  AdminUserListItem,
  AdminUserListQuery,
  AdminUserListResult,
  CreateAdminUserPayload,
  UpdateAdminUserPayload,
} from '@/domain/admin/enterprise/entities/admin-user'

function mapPrismaRole(role: PrismaUserRole): UserRole {
  if (role === PrismaUserRole.personal_trainer) return 'personal-trainer'
  if (role === PrismaUserRole.admin) return 'admin'
  return 'student'
}

function extractPromoPrice(promotion: unknown): number | undefined {
  if (!promotion || typeof promotion !== 'object') return undefined
  const promoPrice = (promotion as TrainerPromotion).promoPrice
  return typeof promoPrice === 'number' ? promoPrice : undefined
}

function mapToListItem(
  user: {
    id: string
    name: string
    email: string
    role: PrismaUserRole
    phone_number: string | null
    avatar_url: string | null
    city: string | null
    state: string | null
    is_active: boolean
    created_at: Date
    trainer?: {
      id: string
      featured: boolean
      contact_phone: string | null
      photo_url: string
      availability: string | null
      city: string | null
      state: string | null
      service_price: number
      promotion: unknown
    } | null
  },
): AdminUserListItem {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: mapPrismaRole(user.role),
    phoneNumber: user.phone_number ?? user.trainer?.contact_phone ?? undefined,
    avatarUrl: user.avatar_url ?? user.trainer?.photo_url ?? undefined,
    city: user.city ?? user.trainer?.city ?? undefined,
    state: user.state ?? user.trainer?.state ?? undefined,
    availability: user.trainer?.availability ?? undefined,
    servicePrice: user.trainer?.service_price,
    promoPrice: extractPromoPrice(user.trainer?.promotion),
    isActive: user.is_active,
    featured: user.trainer?.featured ?? false,
    trainerId: user.trainer?.id,
    createdAt: user.created_at.toISOString(),
  }
}

export class PrismaAdminUsersRepository implements AdminUsersRepository {
  async findMany(query: AdminUserListQuery): Promise<AdminUserListResult> {
    const where: Record<string, unknown> = {}

    if (query.search) {
      where.OR = [
        { name: { contains: query.search, mode: 'insensitive' } },
        { email: { contains: query.search, mode: 'insensitive' } },
      ]
    }

    if (query.role) {
      where.role = mapRoleToPrismaEnum(query.role)
    }

    if (query.isActive !== undefined) {
      where.is_active = query.isActive
    }

    const total = await prisma.user.count({ where })
    const users = await prisma.user.findMany({
      where,
      include: {
        trainer: {
          select: {
            id: true,
            featured: true,
            contact_phone: true,
            photo_url: true,
            availability: true,
            city: true,
            state: true,
            service_price: true,
            promotion: true,
          },
        },
      },
      orderBy: { created_at: 'desc' },
      skip: (query.page - 1) * query.pageSize,
      take: query.pageSize,
    })

    return {
      items: users.map(mapToListItem),
      total,
      page: query.page,
      pageSize: query.pageSize,
      hasMore: query.page * query.pageSize < total,
    }
  }

  async findById(id: string): Promise<AdminUserListItem | null> {
    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        trainer: {
          select: {
            id: true,
            featured: true,
            contact_phone: true,
            photo_url: true,
            availability: true,
            city: true,
            state: true,
            service_price: true,
            promotion: true,
          },
        },
      },
    })
    return user ? mapToListItem(user) : null
  }

  async create(payload: CreateAdminUserPayload, passwordHash: string): Promise<AdminUserListItem> {
    const user = await prisma.user.create({
      data: {
        name: payload.name.trim(),
        email: payload.email.trim().toLowerCase(),
        password_hash: passwordHash,
        role: mapRoleToPrismaEnum(payload.role),
        phone_number: payload.phoneNumber?.trim() || null,
      },
      include: {
        trainer: {
          select: {
            id: true,
            featured: true,
            contact_phone: true,
            photo_url: true,
            availability: true,
            city: true,
            state: true,
            service_price: true,
            promotion: true,
          },
        },
      },
    })

    if (payload.role === 'personal-trainer') {
      const trainer = PersonalTrainer.create(
        {
          ...makePersonalTrainerProps(0),
          name: user.name,
          userId: user.id,
          contactPhone: payload.phoneNumber?.trim() || makePersonalTrainerProps(0).contactPhone,
        },
        user.id,
      )
      await prisma.personalTrainer.create({ data: mapTrainerToPrisma(trainer) })
    }

    const refreshed = await this.findById(user.id)
    return refreshed!
  }

  async update(id: string, payload: UpdateAdminUserPayload): Promise<AdminUserListItem> {
    await prisma.user.update({
      where: { id },
      data: {
        ...(payload.name !== undefined && { name: payload.name.trim() }),
        ...(payload.email !== undefined && { email: payload.email.trim().toLowerCase() }),
        ...(payload.role !== undefined && { role: mapRoleToPrismaEnum(payload.role) }),
        ...(payload.isActive !== undefined && { is_active: payload.isActive }),
        ...(payload.phoneNumber !== undefined && { phone_number: payload.phoneNumber.trim() || null }),
      },
    })

    if (payload.phoneNumber !== undefined) {
      const trainer = await prisma.personalTrainer.findFirst({ where: { user_id: id } })
      if (trainer) {
        await prisma.personalTrainer.update({
          where: { id: trainer.id },
          data: { contact_phone: payload.phoneNumber.trim() || null },
        })
      }
    }

    const refreshed = await this.findById(id)
    if (!refreshed) throw new Error('User not found after update')
    return refreshed
  }

  async toggleFeatured(userId: string, featured: boolean): Promise<AdminUserListItem> {
    const trainer = await prisma.personalTrainer.findFirst({ where: { user_id: userId } })
    if (!trainer) {
      throw new Error('Trainer profile not found')
    }

    await prisma.personalTrainer.update({
      where: { id: trainer.id },
      data: { featured },
    })

    const refreshed = await this.findById(userId)
    if (!refreshed) throw new Error('User not found after featured toggle')
    return refreshed
  }

  async emailExists(email: string, excludeId?: string): Promise<boolean> {
    const user = await prisma.user.findUnique({
      where: { email: email.trim().toLowerCase() },
    })
    if (!user) return false
    if (excludeId && user.id === excludeId) return false
    return true
  }
}
