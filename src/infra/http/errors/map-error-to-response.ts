import {
  ForbiddenError,
  InvalidCredentialsError,
  ResourceNotFoundError,
  UnauthorizedError,
  UserAlreadyExistsError,
  ValidationError,
} from '@/domain/shared/errors/domain-errors'
import { ZodError } from 'zod'

export function mapErrorToResponse(error: unknown) {
  if (error instanceof ZodError) {
    return {
      statusCode: 400,
      body: { message: 'Validation error', issues: error.format() },
    }
  }

  if (error instanceof ValidationError) {
    return {
      statusCode: 400,
      body: { message: error.message, errors: error.errors },
    }
  }

  if (error instanceof InvalidCredentialsError) {
    return {
      statusCode: 401,
      body: {
        message: 'Invalid credentials',
        errors: { email: 'invalidCredentials' },
      },
    }
  }

  if (error instanceof UnauthorizedError) {
    return { statusCode: 401, body: { message: error.message } }
  }

  if (error instanceof ForbiddenError) {
    return { statusCode: 403, body: { message: error.message } }
  }

  if (error instanceof ResourceNotFoundError) {
    return { statusCode: 404, body: { message: error.message } }
  }

  if (error instanceof UserAlreadyExistsError) {
    return {
      statusCode: 400,
      body: { message: 'User could not be created', errors: { email: 'alreadyExists' } },
    }
  }

  return { statusCode: 500, body: { message: 'Internal server error' } }
}
