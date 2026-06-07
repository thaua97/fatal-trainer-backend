import { describe, expect, it } from 'vitest'
import { ListQueryVO, parseListQuery } from './list-query'

describe('ListQueryVO', () => {
  it('creates from params and handles invalid numbers', () => {
    const vo = ListQueryVO.fromParams({
      page: 'invalid',
      pageSize: 'invalid',
      sortBy: 'invalid',
      sortOrder: 'invalid',
      priceView: 'monthly',
      onPromotion: 'false',
    })

    expect(vo.value.priceView).toBe('monthly')
    expect(parseListQuery({ onPromotion: 'false' }).onPromotion).toBe(false)
  })
})
