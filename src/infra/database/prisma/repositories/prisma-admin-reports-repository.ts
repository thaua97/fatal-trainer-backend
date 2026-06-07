import { prisma } from '@/libs/prisma'
import type { ReportStatus as PrismaReportStatus } from '@prisma/client'
import type { AdminReportsRepository } from '@/domain/admin/application/repositories/admin-reports-repository'
import type {
  AdminReportListItem,
  AdminReportListQuery,
  AdminReportListResult,
  ReportStatus,
  ReportType,
} from '@/domain/admin/enterprise/entities/admin-report'

function mapReport(record: {
  id: string
  type: string
  status: PrismaReportStatus
  occurred_at: Date
  trainer_id: string
  description: string
  contact_email: string
  created_at: Date
  resolved_at: Date | null
  resolved_by: string | null
}): AdminReportListItem {
  return {
    id: record.id,
    type: record.type as ReportType,
    status: record.status as ReportStatus,
    occurredAt: record.occurred_at.toISOString(),
    trainerId: record.trainer_id,
    description: record.description,
    contactEmail: record.contact_email,
    createdAt: record.created_at.toISOString(),
    resolvedAt: record.resolved_at?.toISOString(),
    resolvedBy: record.resolved_by ?? undefined,
  }
}

export class PrismaAdminReportsRepository implements AdminReportsRepository {
  async findMany(query: AdminReportListQuery): Promise<AdminReportListResult> {
    const where: Record<string, unknown> = {}
    if (query.status) where.status = query.status
    if (query.type) where.type = query.type

    const total = await prisma.report.count({ where })
    const reports = await prisma.report.findMany({
      where,
      orderBy: { created_at: 'desc' },
      skip: (query.page - 1) * query.pageSize,
      take: query.pageSize,
    })

    const trainerIds = [...new Set(reports.map(r => r.trainer_id))]
    const trainers = await prisma.personalTrainer.findMany({
      where: { id: { in: trainerIds } },
      select: { id: true, name: true },
    })
    const trainerMap = new Map(trainers.map(t => [t.id, t.name]))

    const items = reports.map((r) => {
      const item = mapReport(r)
      item.trainerName = trainerMap.get(r.trainer_id)
      return item
    })

    return {
      items,
      total,
      page: query.page,
      pageSize: query.pageSize,
      hasMore: query.page * query.pageSize < total,
    }
  }

  async findById(id: string): Promise<AdminReportListItem | null> {
    const report = await prisma.report.findUnique({ where: { id } })
    if (!report) return null

    const trainer = await prisma.personalTrainer.findUnique({
      where: { id: report.trainer_id },
      select: { name: true },
    })

    const item = mapReport(report)
    item.trainerName = trainer?.name
    return item
  }

  async updateStatus(id: string, status: ReportStatus, resolvedBy?: string): Promise<AdminReportListItem> {
    const isResolved = status === 'resolved' || status === 'archived'
    await prisma.report.update({
      where: { id },
      data: {
        status,
        resolved_at: isResolved ? new Date() : null,
        resolved_by: isResolved ? resolvedBy ?? null : null,
      },
    })

    const refreshed = await this.findById(id)
    if (!refreshed) throw new Error('Report not found after update')
    return refreshed
  }

  async deactivateTrainerFromReport(reportId: string, adminId: string): Promise<AdminReportListItem> {
    const report = await prisma.report.findUnique({ where: { id: reportId } })
    if (!report) throw new Error('Report not found')

    const trainer = await prisma.personalTrainer.findUnique({
      where: { id: report.trainer_id },
      select: { user_id: true },
    })

    if (trainer?.user_id) {
      await prisma.user.update({
        where: { id: trainer.user_id },
        data: { is_active: false },
      })
    }

    await prisma.report.update({
      where: { id: reportId },
      data: {
        status: 'resolved',
        resolved_at: new Date(),
        resolved_by: adminId,
      },
    })

    const refreshed = await this.findById(reportId)
    if (!refreshed) throw new Error('Report not found after deactivate')
    return refreshed
  }
}
