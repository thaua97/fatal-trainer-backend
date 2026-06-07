import { describe, expect, it } from 'vitest'
import { validateTrainerInfo, validateTrainerPromotion } from './validate-trainer-profile'

describe('validate-trainer-profile', () => {
  it('validates trainer info', () => {
    const invalid = validateTrainerInfo({
      name: '',
      contactPhone: '',
      profession: '',
      description: 'curta',
      specialties: [],
      modalities: [],
      city: '',
      state: '',
      servicePrice: 0,
      cref: '',
      availability: '',
      experienceYears: -1,
    })

    expect(invalid.valid).toBe(false)

    const valid = validateTrainerInfo({
      name: 'Ana Silva',
      contactPhone: '11999999999',
      profession: 'Personal Trainer — HIIT',
      description: 'Descrição completa com mais de vinte caracteres.',
      specialties: ['HIIT'],
      modalities: ['presencial'],
      city: 'São Paulo',
      state: 'SP',
      servicePrice: 120,
      cref: '123456-G/SP',
      availability: 'Seg–Sex 8h–18h',
      experienceYears: 5,
    })

    expect(valid.valid).toBe(true)
  })

  it('validates trainer promotion', () => {
    const inactive = validateTrainerPromotion(
      {
        active: false,
        discountPercent: 0,
        label: '',
        startsAt: '',
        endsAt: '',
        maxRedemptions: null,
      },
      100,
    )

    expect(inactive.valid).toBe(true)

    const active = validateTrainerPromotion(
      {
        active: true,
        discountPercent: 20,
        label: 'Promo',
        startsAt: '2026-06-01',
        endsAt: '2026-06-30',
        maxRedemptions: 10,
      },
      100,
    )

    expect(active.valid).toBe(true)
  })
})
