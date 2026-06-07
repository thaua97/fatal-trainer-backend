import { describe, expect, it } from 'vitest'
import { PersonalTrainer } from './personal-trainer'

describe('PersonalTrainer', () => {
  it('creates and serializes trainer', () => {
    const trainer = PersonalTrainer.create({
      name: 'Ana',
      profession: 'Personal Trainer — HIIT',
      description: 'Bio longa o suficiente para testes de serialização.',
      photoUrl: 'https://example.com/photo.jpg',
      servicePrice: 120,
    })

    const json = trainer.toJSON()
    expect(json.name).toBe('Ana')
    expect(trainer.id).toBeTruthy()

    const restored = PersonalTrainer.restore('trainer-001', {
      ...json,
      userId: undefined,
    })
    expect(restored.id).toBe('trainer-001')
  })
})
