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
})
