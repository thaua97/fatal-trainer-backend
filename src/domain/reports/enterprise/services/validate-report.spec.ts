import { describe, expect, it } from 'vitest'
import { validateReport } from './validate-report'

describe('validateReport', () => {
  it('validates report payload', () => {
    const invalid = validateReport({
      type: 'other',
      occurredAt: '',
      trainerId: '',
      description: 'short',
      contactEmail: 'invalid',
    })

    expect(invalid.valid).toBe(false)

    const valid = validateReport(
      {
        type: 'other',
        occurredAt: '2026-06-01',
        trainerId: 'trainer-001',
        description: 'Descrição detalhada da denúncia para validação.',
        contactEmail: 'user@example.com',
      },
      { trainerExists: true },
    )

    expect(valid.valid).toBe(true)
  })

  it('accepts all frontend report types', () => {
    const types = ['abuse', 'offense', 'wrong_pricing', 'fake_profile', 'harassment', 'spam', 'other'] as const

    for (const type of types) {
      const result = validateReport(
        {
          type,
          occurredAt: '2026-06-01',
          trainerId: 'trainer-001',
          description: 'Descrição detalhada da denúncia para validação.',
          contactEmail: 'user@example.com',
        },
        { trainerExists: true },
      )

      expect(result.valid).toBe(true)
    }
  })

  it('rejects unknown report type', () => {
    const result = validateReport(
      {
        type: 'invalid' as 'other',
        occurredAt: '2026-06-01',
        trainerId: 'trainer-001',
        description: 'Descrição detalhada da denúncia para validação.',
        contactEmail: 'user@example.com',
      },
      { trainerExists: true },
    )

    expect(result.valid).toBe(false)
    expect(result.errors.type).toBe('invalid')
  })
})
