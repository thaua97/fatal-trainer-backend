import { describe, expect, it } from 'vitest'
import { normalizeSearch } from './normalize-search'

describe('normalizeSearch', () => {
  it('normalizes accents and case', () => {
    expect(normalizeSearch('  FuncionÁl  ')).toBe('funcional')
  })
})
