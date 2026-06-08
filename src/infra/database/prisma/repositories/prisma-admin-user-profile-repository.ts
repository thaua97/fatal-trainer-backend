import { prisma } from '@/libs/prisma'
import { UserRole as PrismaUserRole } from '@prisma/client'
import type { UserRole } from '@/domain/auth/enterprise/entities/user'
import { mapTrainerToDomain } from '../mappers/prisma-mapper'
import { presentTrainer } from '@/infra/http/presenters/trainer-presenter'
import type { AdminUserProfileRepository } from '@/domain/admin/application/repositories/admin-user-profile-repository'
import type {
  AdminUserActivityItem,
  AdminUserActivityListQuery,
  AdminUserActivityListResult,
  AdminUserActivityType,
  AdminUserDetail,
  AdminUserNote,
  AppendAdminUserActivityPayload,
} from '@/domain/admin/enterprise/entities/admin-user-profile'
import { PrismaAdminUsersRepository } from './prisma-admin-users-repository'

function mapPrismaRole(role: PrismaUserRole | null | undefined): UserRole | undefined {
  if (!role) return undefined
  if (role === PrismaUserRole.personal_trainer) return 'personal-trainer'
  if (role === PrismaUserRole.admin) return 'admin'
  return 'student'
}

function mapActivity(record: {
  id: string
  user_id: string
  type: string
  title: string
  description: string | null
  actor_id: string | null
  actor_name: string | null
  actor_role: PrismaUserRole | null
  changes: unknown
  metadata: unknown
  created_at: Date
}): AdminUserActivityItem {
  return {
    id: record.id,
    userId: record.user_id,
    type: record.type as AdminUserActivityType,
    title: record.title,
    description: record.description ?? undefined,
    actorId: record.actor_id ?? undefined,
    actorName: record.actor_name ?? undefined,
    actorRole: mapPrismaRole(record.actor_role),
    changes: Array.isArray(record.changes) ? record.changes as AdminUserActivityItem['changes'] : undefined,
    metadata: record.metadata && typeof record.metadata === 'object'
      ? record.metadata as Record<string, string>
      : undefined,
    createdAt: record.created_at.toISOString(),
  }
}

export class PrismaAdminUserProfileRepository implements AdminUserProfileRepository {
  private readonly adminUsersRepository = new PrismaAdminUsersRepository()

  async findDetailById(userId: string): Promise<AdminUserDetail | null> {
    const user = await this.adminUsersRepository.findById(userId)
    if (!user) return null

    const trainerRecord = await prisma.personalTrainer.findFirst({
      where: { user_id: userId },
    })

    const [notesCount, activityCount] = await Promise.all([
      this.countNotes(userId),
      this.countActivity(userId),
    ])

    const detail: AdminUserDetail = {
      ...user,
      notesCount,
      activityCount,
    }

    if (trainerRecord) {
      const trainer = mapTrainerToDomain(trainerRecord)
      detail.trainer = presentTrainer(trainer)
    }

    return detail
  }

  async listActivity(userId: string, query: AdminUserActivityListQuery): Promise<AdminUserActivityListResult> {
    const where = { user_id: userId }
    const total = await prisma.adminUserActivity.count({ where })
    const records = await prisma.adminUserActivity.findMany({
      where,
      orderBy: { created_at: 'desc' },
      skip: (query.page - 1) * query.pageSize,
      take: query.pageSize,
    })

    return {
      items: records.map(mapActivity),
      total,
      page: query.page,
      pageSize: query.pageSize,
      hasMore: query.page * query.pageSize < total,
    }
  }

  async countActivity(userId: string): Promise<number> {
    return prisma.adminUserActivity.count({ where: { user_id: userId } })
  }

  async appendActivity(payload: AppendAdminUserActivityPayload): Promise<void> {
    await prisma.adminUserActivity.create({
      data: {
        user_id: payload.userId,
        type: payload.type,
        title: payload.title,
        description: payload.description ?? null,
        actor_id: payload.actorId ?? null,
        actor_name: payload.actorName ?? null,
        actor_role: payload.actorRole
          ? (payload.actorRole === 'personal-trainer'
            ? PrismaUserRole.personal_trainer
            : payload.actorRole === 'admin'
              ? PrismaUserRole.admin
              : PrismaUserRole.student)
          : null,
        changes: payload.changes ?? undefined,
        metadata: payload.metadata ?? undefined,
      },
    })
  }

  async listNotes(userId: string): Promise<AdminUserNote[]> {
    const records = await prisma.adminUserNote.findMany({
      where: { user_id: userId },
      orderBy: { created_at: 'desc' },
    })

    return records.map(record => ({
      id: record.id,
      userId: record.user_id,
      authorId: record.author_id,
      authorName: record.author_name,
      content: record.content,
      createdAt: record.created_at.toISOString(),
    }))
  }

  async countNotes(userId: string): Promise<number> {
    return prisma.adminUserNote.count({ where: { user_id: userId } })
  }

  async createNote(
    userId: string,
    authorId: string,
    authorName: string,
    content: string,
  ): Promise<AdminUserNote> {
    const record = await prisma.adminUserNote.create({
      data: {
        user_id: userId,
        author_id: authorId,
        author_name: authorName,
        content: content.trim(),
      },
    })

    return {
      id: record.id,
      userId: record.user_id,
      authorId: record.author_id,
      authorName: record.author_name,
      content: record.content,
      createdAt: record.created_at.toISOString(),
    }
  }
}
