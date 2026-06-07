import { describe, expect, it } from 'vitest'
import { generateMockTrainers } from '@/utils/tests/factories/make-personal-trainer'
import { InMemoryPersonalTrainersRepository } from '@/utils/tests/repositories/in-memory-personal-trainers-repository'
import { InMemoryReportsRepository } from '@/utils/tests/repositories/in-memory-reports-repository'
import { CreateReportUseCase } from './create-report'

describe('CreateReportUseCase', () => {
  it('creates report when trainer exists', async () => {
    const trainersRepository = new InMemoryPersonalTrainersRepository()
    trainersRepository.items = generateMockTrainers(1)

    const reportsRepository = new InMemoryReportsRepository()
    const sut = new CreateReportUseCase(reportsRepository, trainersRepository)

    const result = await sut.execute({
      type: 'other',
      occurredAt: '2026-06-01',
      trainerId: trainersRepository.items[0]!.id,
      description: 'Descrição detalhada da denúncia para validação.',
      contactEmail: 'user@example.com',
    })

    expect(result.id).toBeDefined()
  })
})
