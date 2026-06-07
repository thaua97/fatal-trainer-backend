import { describe, expect, it } from 'vitest'
import { PersonalTrainer } from '@/domain/catalog/enterprise/entities/personal-trainer'
import {
  enrichAuthUserWithTrainer,
  mapStoredUserToAuthUser,
} from './build-auth-user'

describe('build-auth-user', () => {
  it('maps stored user to auth user', () => {
    const authUser = mapStoredUserToAuthUser({
      id: '1',
      name: 'Carlos',
      email: 'carlos@example.com',
      role: 'personal-trainer',
      passwordHash: 'hash',
      phoneNumber: '53991625225',
      isActive: true,
      createdAt: '2026-06-06T00:00:00.000Z',
    })

    expect(authUser.phoneNumber).toBe('53991625225')
    expect(authUser.createdAt).toBe('2026-06-06T00:00:00.000Z')
  })

  it('enriches auth user with trainer profile data', () => {
    const trainer = PersonalTrainer.create({
      name: 'Carlos',
      profession: 'Personal Trainer',
      description: 'Descrição com mais de vinte caracteres aqui.',
      photoUrl: 'https://example.com/photo.jpg',
      servicePrice: 100,
      contactPhone: '53991625225',
      availability: 'Seg–Sex, 6h–21h',
      city: 'Pelotas',
      state: 'RS',
    })

    const enriched = enrichAuthUserWithTrainer(
      {
        id: '1',
        name: 'Carlos',
        email: 'carlos@example.com',
        role: 'personal-trainer',
      },
      trainer,
    )

    expect(enriched.phoneNumber).toBe('53991625225')
    expect(enriched.avatarUrl).toBe('https://example.com/photo.jpg')
    expect(enriched.city).toBe('Pelotas')
    expect(enriched.state).toBe('RS')
  })
})
