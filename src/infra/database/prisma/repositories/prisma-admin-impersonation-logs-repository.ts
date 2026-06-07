import { prisma } from '@/libs/prisma'
import { UserRole as PrismaUserRole } from '@prisma/client'
import type { UserRole } from '@/domain/auth/enterprise/entities/user'
import type { AdminImpersonationLogsRepository } from '@/domain/admin/application/repositories/admin-impersonation-logs-repository'
import type {
  AdminRecentAccessItem,
  CreateImpersonationLogPayload,
} from '@/domain/admin/enterprise/entities/admin-impersonation-log'

function mapPrismaRole(role: PrismaUserRole): UserRole {
  if (role === PrismaUserRole.personal_trainer) return 'personal-trainer'
  if (role === PrismaUserRole.admin) return 'admin'
  return 'student'
}

function mapRoleToPrisma(role: UserRole): PrismaUserRole {
  if (role === 'personal-trainer') return PrismaUserRole.personal_trainer
  if (role === 'admin') return PrismaUserRole.admin
  return PrismaUserRole.student
}

export class PrismaAdminImpersonationLogsRepository implements AdminImpersonationLogsRepository {
  async create(payload: CreateImpersonationLogPayload): Promise<void> {
    await prisma.adminImpersonationLog.create({
      data: {
        admin_user_id: payload.adminUserId,
        target_user_id: payload.targetUserId,
        target_name: payload.targetName,
        target_role: mapRoleToPrisma(payload.targetRole),
      },
    })
  }

  async findRecentByAdmin(adminUserId: string, limit: number): Promise<AdminRecentAccessItem[]> {
    const logs = await prisma.adminImpersonationLog.findMany({
      where: { admin_user_id: adminUserId },
      orderBy: { accessed_at: 'desc' },
      take: limit,
    })

    return logs.map((log) => ({
      id: log.id,
      targetUserId: log.target_user_id,
      targetName: log.target_name,
      targetRole: mapPrismaRole(log.target_role),
      accessedAt: log.accessed_at.toISOString(),
    }))
  }
}
