import { prisma } from '@/libs/prisma'
import type { ReportPayload } from '@/domain/reports/enterprise/entities/report'
import type {
  CreateReportResult,
  ReportsRepository,
} from '@/domain/reports/application/repositories/reports-repository'

export class PrismaReportsRepository implements ReportsRepository {
  async create(payload: ReportPayload): Promise<CreateReportResult> {
    const report = await prisma.report.create({
      data: {
        type: payload.type,
        occurred_at: new Date(`${payload.occurredAt}T12:00:00`),
        trainer_id: payload.trainerId,
        description: payload.description.trim(),
        contact_email: payload.contactEmail.trim(),
      },
    })

    return {
      id: report.id,
      createdAt: report.created_at.toISOString(),
    }
  }
}
