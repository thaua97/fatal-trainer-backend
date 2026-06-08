import { describe, expect, it } from 'vitest'
import { ResourceNotFoundError, ValidationError } from '@/domain/shared/errors/domain-errors'
import { generateMockTrainers } from '@/utils/tests/factories/make-personal-trainer'
import { InMemoryPersonalTrainersRepository } from '@/utils/tests/repositories/in-memory-personal-trainers-repository'
import { InMemoryPromotionTemplatesRepository } from '@/utils/tests/repositories/in-memory-promotion-templates-repository'
import { InMemoryUsersRepository } from '@/utils/tests/repositories/in-memory-users-repository'
import { UpdateMyTrainerUseCase } from './update-my-trainer'

describe('UpdateMyTrainerUseCase errors', () => {
  it('throws domain errors for invalid updates', async () => {
    const templatesRepository = new InMemoryPromotionTemplatesRepository()
    const repository = new InMemoryPersonalTrainersRepository(templatesRepository)
    const usersRepository = new InMemoryUsersRepository()
    const trainer = generateMockTrainers(1)[0]!
    repository.items = [trainer]

    const template = await templatesRepository.create({
      name: 'Promo',
      label: 'Promo',
      discountPercent: 20,
      startsAt: '2026-01-01',
      endsAt: '2026-12-31',
      maxRedemptions: 10,
    })

    const sut = new UpdateMyTrainerUseCase(
      repository,
      usersRepository,
      templatesRepository,
    )

    await expect(
      sut.execute({ trainerId: 'missing', section: 'info', info: undefined }),
    ).rejects.toBeInstanceOf(ResourceNotFoundError)

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

    const updated = await sut.execute({
      trainerId: trainer.id,
      section: 'promotion',
      promotion: {
        templateId: template.id,
      },
    })

    expect(updated.props.promotion?.templateId).toBe(template.id)
    expect(updated.props.promotion?.discountPercent).toBe(20)
  })
})
