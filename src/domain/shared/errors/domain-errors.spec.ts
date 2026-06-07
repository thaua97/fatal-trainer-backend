import { describe, expect, it } from 'vitest'
import { mapErrorToResponse } from '@/infra/http/errors/map-error-to-response'
import {
  ForbiddenError,
  InvalidCredentialsError,
  ResourceNotFoundError,
  UnauthorizedError,
  UserAlreadyExistsError,
  ValidationError,
} from '@/domain/shared/errors/domain-errors'
import { ZodError } from 'zod'

describe('mapErrorToResponse', () => {
  it('maps known errors', () => {
    expect(mapErrorToResponse(new ValidationError({ email: 'invalid' })).statusCode).toBe(400)
    expect(mapErrorToResponse(new InvalidCredentialsError()).statusCode).toBe(401)
    expect(mapErrorToResponse(new UnauthorizedError()).statusCode).toBe(401)
    expect(mapErrorToResponse(new ForbiddenError()).statusCode).toBe(403)
    expect(mapErrorToResponse(new ResourceNotFoundError()).statusCode).toBe(404)
    expect(mapErrorToResponse(new UserAlreadyExistsError()).statusCode).toBe(400)
    expect(mapErrorToResponse(new ZodError([])).statusCode).toBe(400)
    expect(mapErrorToResponse(new Error('unknown')).statusCode).toBe(500)
  })
})
