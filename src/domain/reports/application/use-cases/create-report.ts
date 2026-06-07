import { ValidationError } from '@/domain/shared/errors/domain-errors'
import type { ReportPayload } from '../../enterprise/entities/report'
import { validateReport } from '../../enterprise/services/validate-report'
import type { PersonalTrainersRepository } from '@/domain/catalog/application/repositories/personal-trainers-repository'
import type { CreateReportResult, ReportsRepository } from '../repositories/reports-repository'

export class CreateReportUseCase {
  constructor(
    private readonly reportsRepository: ReportsRepository,
    private readonly trainersRepository: PersonalTrainersRepository,
  ) {}

  async execute(payload: ReportPayload): Promise<CreateReportResult> {
    const trainerExists = payload.trainerId
      ? Boolean(await this.trainersRepository.findById(payload.trainerId))
      : undefined

    const validation = validateReport(payload, { trainerExists })
    if (!validation.valid) {
      throw new ValidationError(validation.errors)
    }

    return this.reportsRepository.create(payload)
  }
}
