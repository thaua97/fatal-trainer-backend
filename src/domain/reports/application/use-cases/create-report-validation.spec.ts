import { describe, expect, it } from 'vitest'
import { ValidationError } from '@/domain/shared/errors/domain-errors'
import { InMemoryPersonalTrainersRepository } from '@/utils/tests/repositories/in-memory-personal-trainers-repository'
import { InMemoryReportsRepository } from '@/utils/tests/repositories/in-memory-reports-repository'
import { CreateReportUseCase } from './create-report'

describe('CreateReportUseCase validation', () => {
  it('throws when validation fails', async () => {
    const trainersRepository = new InMemoryPersonalTrainersRepository()
    const reportsRepository = new InMemoryReportsRepository()
    const sut = new CreateReportUseCase(reportsRepository, trainersRepository)

    await expect(
      sut.execute({
        type: 'other',
        occurredAt: '',
        trainerId: '',
        description: 'curta',
        contactEmail: 'invalid',
      }),
    ).rejects.toBeInstanceOf(ValidationError)
  })
})
