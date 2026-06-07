import { describe, expect, it } from 'vitest'
import { ValidationError } from '@/domain/shared/errors/domain-errors'
import { generateMockTrainers } from '@/utils/tests/factories/make-personal-trainer'
import { InMemoryPersonalTrainersRepository } from '@/utils/tests/repositories/in-memory-personal-trainers-repository'
import { UpdateMyTrainerUseCase } from './update-my-trainer'

describe('UpdateMyTrainerUseCase errors', () => {
  it('throws validation errors', async () => {
    const repository = new InMemoryPersonalTrainersRepository()
    const trainer = generateMockTrainers(1)[0]!
    repository.items = [trainer]

    const sut = new UpdateMyTrainerUseCase(repository)

    await expect(
      sut.execute({ trainerId: 'missing', section: 'info', info: undefined }),
    ).rejects.toBeInstanceOf(ValidationError)

    await expect(
      sut.execute({
        trainerId: trainer.id,
        section: 'info',
        info: {
          name: '',
          contactPhone: '',
          profession: '',
          description: '',
          specialties: [],
          modalities: [],
          city: '',
          state: '',
          servicePrice: 0,
          cref: '',
          availability: '',
          experienceYears: 0,
        },
      }),
    ).rejects.toBeInstanceOf(ValidationError)

    await expect(
      sut.execute({
        trainerId: trainer.id,
        section: 'promotion',
        promotion: {
          active: true,
          discountPercent: 20,
          label: 'Promo',
          startsAt: '2026-06-01',
          endsAt: '2026-06-30',
          maxRedemptions: 10,
        },
      }),
    ).resolves.toBeDefined()
  })
})
