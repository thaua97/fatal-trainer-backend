import { describe, expect, it } from 'vitest'
import { z } from 'zod'
import { flattenZodErrors } from './flatten-zod-errors'

describe('flattenZodErrors', () => {
  it('flattens field paths to error codes', () => {
    const schema = z.object({
      email: z.string().email(),
      password: z.string().min(8),
    })

    const result = schema.safeParse({ email: 'bad', password: '123' })
    if (result.success) {
      throw new Error('expected validation failure')
    }

    expect(flattenZodErrors(result.error)).toEqual({
      email: 'invalid',
      password: 'invalid',
    })
  })

  it('maps missing fields to required', () => {
    const schema = z.object({
      email: z.string(),
    })

    const result = schema.safeParse({})
    if (result.success) {
      throw new Error('expected validation failure')
    }

    expect(flattenZodErrors(result.error)).toEqual({
      email: 'required',
    })
  })
})
