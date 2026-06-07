import { describe, expect, it } from 'vitest'
import { makePersonalTrainer } from '@/utils/tests/factories/make-personal-trainer'
import { InMemoryPersonalTrainersRepository } from '@/utils/tests/repositories/in-memory-personal-trainers-repository'
import { GetPersonalTrainerByIdUseCase } from './get-personal-trainer-by-id'
import { ResourceNotFoundError } from '@/domain/shared/errors/domain-errors'

describe('GetPersonalTrainerByIdUseCase', () => {
  it('returns trainer when found', async () => {
    const repository = new InMemoryPersonalTrainersRepository()
    const trainer = makePersonalTrainer(0)
    repository.items = [trainer]

    const sut = new GetPersonalTrainerByIdUseCase(repository)
    const result = await sut.execute(trainer.id)

    expect(result.id).toBe(trainer.id)
  })

  it('throws when trainer is missing', async () => {
    const sut = new GetPersonalTrainerByIdUseCase(new InMemoryPersonalTrainersRepository())

    await expect(sut.execute('missing')).rejects.toBeInstanceOf(ResourceNotFoundError)
  })
})
