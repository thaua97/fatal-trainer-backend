import { describe, expect, it } from 'vitest'
import { generateMockTrainers } from '@/utils/tests/factories/make-personal-trainer'
import { InMemoryPersonalTrainersRepository } from '@/utils/tests/repositories/in-memory-personal-trainers-repository'
import { InMemoryUsersRepository } from '@/utils/tests/repositories/in-memory-users-repository'
import { ListFeaturedTrainersUseCase } from './list-featured-trainers'
import { GetOrCreateMyTrainerUseCase } from './get-or-create-my-trainer'
import { UpdateMyTrainerUseCase } from './update-my-trainer'
import {
  DeleteGalleryImageUseCase,
  SetGalleryCoverUseCase,
  UploadGalleryImageUseCase,
} from './gallery-use-cases'

describe('Catalog use cases', () => {
  it('lists featured trainers', async () => {
    const repository = new InMemoryPersonalTrainersRepository()
    repository.items = generateMockTrainers(10)

    const sut = new ListFeaturedTrainersUseCase(repository)
    const result = await sut.execute(3)
    expect(result.length).toBeLessThanOrEqual(3)
  })

  it('gets or creates trainer profile', async () => {
    const repository = new InMemoryPersonalTrainersRepository()
    const sut = new GetOrCreateMyTrainerUseCase(repository)

    const created = await sut.execute({
      id: 'user-1',
      name: 'Carlos',
      email: 'carlos@example.com',
      role: 'personal-trainer',
    })

    expect(created.created).toBe(true)

    const existing = await sut.execute({
      id: 'user-1',
      name: 'Carlos',
      email: 'carlos@example.com',
      role: 'personal-trainer',
    })

    expect(existing.created).toBe(false)
  })

  it('updates trainer info and gallery', async () => {
    const repository = new InMemoryPersonalTrainersRepository()
    const usersRepository = new InMemoryUsersRepository()
    const trainer = generateMockTrainers(1)[0]!
    repository.items = [trainer]
    usersRepository.items.push({
      id: 'user-1',
      name: trainer.props.name,
      email: 'carlos@example.com',
      role: 'personal-trainer',
      passwordHash: 'hash',
      isActive: true,
    })
    trainer.props.userId = 'user-1'

    const update = new UpdateMyTrainerUseCase(repository, usersRepository)
    const updated = await update.execute({
      trainerId: trainer.id,
      section: 'info',
      info: {
        name: 'Updated Name',
        contactPhone: '11999999999',
        profession: 'Personal Trainer — Funcional',
        description: 'Descrição atualizada com mais de vinte caracteres.',
        specialties: ['Funcional'],
        modalities: ['presencial'],
        city: 'São Paulo',
        state: 'SP',
        servicePrice: 150,
        cref: '123456-G/SP',
        availability: 'Seg–Sex 8h–18h',
        experienceYears: 5,
      },
    })

    expect(updated.props.name).toBe('Updated Name')

    const upload = new UploadGalleryImageUseCase(repository)
    const withImage = await upload.execute(trainer.id, '/uploads/test.jpg')
    expect(withImage.props.gallery).toContain('/uploads/test.jpg')

    const setCover = new SetGalleryCoverUseCase(repository)
    const withCover = await setCover.execute(trainer.id, '/uploads/test.jpg')
    expect(withCover.props.photoUrl).toBe('/uploads/test.jpg')

    const remove = new DeleteGalleryImageUseCase(repository)
    const withoutImage = await remove.execute(trainer.id, 0)
    expect(withoutImage.props.gallery?.length).toBe(3)
  })
})
