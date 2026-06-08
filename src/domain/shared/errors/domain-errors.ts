export class ResourceNotFoundError extends Error {
  constructor(message = 'Resource not found') {
    super(message)
    this.name = 'ResourceNotFoundError'
  }
}

export class InvalidCredentialsError extends Error {
  constructor() {
    super('Invalid credentials')
    this.name = 'InvalidCredentialsError'
  }
}

export class AccountDeactivatedError extends Error {
  constructor() {
    super('Account deactivated')
    this.name = 'AccountDeactivatedError'
  }
}

export class UserAlreadyExistsError extends Error {
  constructor() {
    super('User already exists')
    this.name = 'UserAlreadyExistsError'
  }
}

export class ValidationError extends Error {
  constructor(
    public readonly errors: Record<string, string>,
    message = 'Validation failed',
  ) {
    super(message)
    this.name = 'ValidationError'
  }
}

export class UnauthorizedError extends Error {
  constructor(message = 'Unauthorized') {
    super(message)
    this.name = 'UnauthorizedError'
  }
}

export class ForbiddenError extends Error {
  constructor(message = 'Forbidden') {
    super(message)
    this.name = 'ForbiddenError'
  }
}

export class ConflictError extends Error {
  constructor(message = 'Conflict') {
    super(message)
    this.name = 'ConflictError'
  }
}
