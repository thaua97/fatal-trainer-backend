import { describe, expect, it } from 'vitest'
import { validateReport } from './validate-report'

describe('validateReport branches', () => {
  it('covers trainer not found and invalid type', () => {
    expect(
      validateReport(
        {
          type: 'invalid' as 'other',
          occurredAt: '2026-06-01',
          trainerId: 'trainer-001',
          description: 'Descrição detalhada da denúncia para validação.',
          contactEmail: 'user@example.com',
        },
        { trainerExists: false },
      ).valid,
    ).toBe(false)
  })
})
