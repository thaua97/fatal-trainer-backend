import { describe, expect, it } from 'vitest'
import { parseListQuery, DEFAULT_LIST_QUERY } from './list-query'

describe('parseListQuery', () => {
  it('parses defaults', () => {
    const query = parseListQuery({})
    expect(query.page).toBe(DEFAULT_LIST_QUERY.page)
    expect(query.sortBy).toBe(DEFAULT_LIST_QUERY.sortBy)
  })

  it('parses filters and pagination', () => {
    const query = parseListQuery({
      search: 'funcional',
      specialties: 'Musculação,HIIT',
      minPrice: '100',
      maxPrice: '200',
      minRating: '4',
      maxDistanceKm: '5',
      onPromotion: 'true',
      sortBy: 'price',
      sortOrder: 'desc',
      page: '2',
      pageSize: '12',
    })

    expect(query.search).toBe('funcional')
    expect(query.specialties).toEqual(['Musculação', 'HIIT'])
    expect(query.minPrice).toBe(100)
    expect(query.onPromotion).toBe(true)
    expect(query.page).toBe(2)
  })
})
