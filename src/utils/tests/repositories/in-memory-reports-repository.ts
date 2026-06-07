import { randomUUID } from 'node:crypto'
import type { ReportPayload } from '@/domain/reports/enterprise/entities/report'
import type {
  CreateReportResult,
  ReportsRepository,
} from '@/domain/reports/application/repositories/reports-repository'

export class InMemoryReportsRepository implements ReportsRepository {
  public items: CreateReportResult[] = []

  async create(payload: ReportPayload): Promise<CreateReportResult> {
    const result = {
      id: randomUUID(),
      createdAt: new Date().toISOString(),
    }
    this.items.push(result)
    return result
  }
}
