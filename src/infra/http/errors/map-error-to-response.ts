import {
  ConflictError,
  ForbiddenError,
  InvalidCredentialsError,
  ResourceNotFoundError,
  UnauthorizedError,
  UserAlreadyExistsError,
  ValidationError,
} from '@/domain/shared/errors/domain-errors'
import { Prisma } from '@prisma/client'
import { ZodError } from 'zod'
import { ERROR_CODES } from './error-codes'
import { flattenZodErrors } from './flatten-zod-errors'

export type ErrorResponse = {
  statusCode: number
  body: {
    message: string
    errors?: Record<string, string>
  }
}

function mapPrismaError(error: Prisma.PrismaClientKnownRequestError): ErrorResponse | null {
  if (error.code === 'P2002') {
    const target = Array.isArray(error.meta?.target)
      ? error.meta.target[0]
      : typeof error.meta?.target === 'string'
        ? error.meta.target
        : 'field'

    const field = typeof target === 'string' ? target : 'field'

    return {
      statusCode: 409,
      body: {
        message: ERROR_CODES.conflict,
        errors: { [field]: 'alreadyExists' },
      },
    }
  }

  if (error.code === 'P2025') {
    return {
      statusCode: 404,
      body: { message: ERROR_CODES.notFound },
    }
  }

  return null
}

export function mapErrorToResponse(error: unknown): ErrorResponse {
  if (error instanceof ZodError) {
    return {
      statusCode: 400,
      body: {
        message: ERROR_CODES.validation,
        errors: flattenZodErrors(error),
      },
    }
  }

  if (error instanceof ValidationError) {
    return {
      statusCode: 400,
      body: {
        message: ERROR_CODES.validation,
        errors: error.errors,
      },
    }
  }

  if (error instanceof InvalidCredentialsError) {
    return {
      statusCode: 401,
      body: {
        message: ERROR_CODES.invalidCredentials,
        errors: { email: 'invalidCredentials' },
      },
    }
  }

  if (error instanceof UnauthorizedError) {
    return {
      statusCode: 401,
      body: { message: ERROR_CODES.unauthorized },
    }
  }

  if (error instanceof ForbiddenError) {
    return {
      statusCode: 403,
      body: { message: ERROR_CODES.forbidden },
    }
  }

  if (error instanceof ResourceNotFoundError) {
    return {
      statusCode: 404,
      body: { message: ERROR_CODES.notFound },
    }
  }

  if (error instanceof UserAlreadyExistsError) {
    return {
      statusCode: 400,
      body: {
        message: ERROR_CODES.validation,
        errors: { email: 'alreadyExists' },
      },
    }
  }

  if (error instanceof ConflictError) {
    return {
      statusCode: 409,
      body: { message: ERROR_CODES.conflict },
    }
  }

  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    const mapped = mapPrismaError(error)
    if (mapped) {
      return mapped
    }
  }

  return {
    statusCode: 500,
    body: { message: ERROR_CODES.internal },
  }
}
