import { describe, expect, it } from 'vitest'
import { Prisma } from '@prisma/client'
import { mapErrorToResponse } from '@/infra/http/errors/map-error-to-response'
import { ERROR_CODES } from '@/infra/http/errors/error-codes'
import {
  AccountDeactivatedError,
  ConflictError,
  ForbiddenError,
  InvalidCredentialsError,
  ResourceNotFoundError,
  UnauthorizedError,
  UserAlreadyExistsError,
  ValidationError,
} from '@/domain/shared/errors/domain-errors'
import { z } from 'zod'

describe('mapErrorToResponse', () => {
  it('maps known errors to stable message codes', () => {
    expect(mapErrorToResponse(new ValidationError({ email: 'invalid' }))).toEqual({
      statusCode: 400,
      body: { message: ERROR_CODES.validation, errors: { email: 'invalid' } },
    })
    expect(mapErrorToResponse(new AccountDeactivatedError())).toEqual({
      statusCode: 403,
      body: { message: ERROR_CODES.accountDeactivated },
    })
    expect(mapErrorToResponse(new InvalidCredentialsError())).toEqual({
      statusCode: 401,
      body: {
        message: ERROR_CODES.invalidCredentials,
        errors: { email: 'invalidCredentials' },
      },
    })
    expect(mapErrorToResponse(new UnauthorizedError())).toEqual({
      statusCode: 401,
      body: { message: ERROR_CODES.unauthorized },
    })
    expect(mapErrorToResponse(new ForbiddenError())).toEqual({
      statusCode: 403,
      body: { message: ERROR_CODES.forbidden },
    })
    expect(mapErrorToResponse(new ResourceNotFoundError())).toEqual({
      statusCode: 404,
      body: { message: ERROR_CODES.notFound },
    })
    expect(mapErrorToResponse(new UserAlreadyExistsError())).toEqual({
      statusCode: 400,
      body: { message: ERROR_CODES.validation, errors: { email: 'alreadyExists' } },
    })
    expect(mapErrorToResponse(new ConflictError())).toEqual({
      statusCode: 409,
      body: { message: ERROR_CODES.conflict },
    })
    expect(mapErrorToResponse(new Error('unknown'))).toEqual({
      statusCode: 500,
      body: { message: ERROR_CODES.internal },
    })
  })

  it('maps ZodError to flat field errors', () => {
    const schema = z.object({ email: z.string().email() })
    const result = schema.safeParse({ email: 'bad' })
    if (result.success) {
      throw new Error('expected validation failure')
    }

    const mapped = mapErrorToResponse(result.error)
    expect(mapped.statusCode).toBe(400)
    expect(mapped.body.message).toBe(ERROR_CODES.validation)
    expect(mapped.body.errors).toEqual({ email: 'invalid' })
  })

  it('maps Prisma unique constraint violations', () => {
    const error = new Prisma.PrismaClientKnownRequestError('Unique constraint failed', {
      code: 'P2002',
      clientVersion: '5.0.0',
      meta: { target: ['email'] },
    })

    expect(mapErrorToResponse(error)).toEqual({
      statusCode: 409,
      body: {
        message: ERROR_CODES.conflict,
        errors: { email: 'alreadyExists' },
      },
    })
  })

  it('maps Prisma record not found', () => {
    const error = new Prisma.PrismaClientKnownRequestError('Record not found', {
      code: 'P2025',
      clientVersion: '5.0.0',
    })

    expect(mapErrorToResponse(error)).toEqual({
      statusCode: 404,
      body: { message: ERROR_CODES.notFound },
    })
  })
})
