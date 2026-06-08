import { hash } from 'bcryptjs'
import {
  AccountDeactivatedError,
  InvalidCredentialsError,
  UserAlreadyExistsError,
  ValidationError,
} from '@/domain/shared/errors/domain-errors'
import type { AuthUser, RegisterPayload } from '../../enterprise/entities/user'
import { validateLogin, validateRegister } from '../../enterprise/services/validate-auth'
import { mapStoredUserToAuthUser } from '../../enterprise/services/build-auth-user'
import type { SessionsRepository, UsersRepository } from '../repositories/users-repository'

export class RegisterUserUseCase {
  constructor(private readonly usersRepository: UsersRepository) {}

  async execute(payload: RegisterPayload): Promise<AuthUser> {
    const validation = validateRegister(payload)
    if (!validation.valid) {
      throw new ValidationError(validation.errors)
    }

    const existing = await this.usersRepository.findByEmail(payload.email)
    if (existing) {
      throw new UserAlreadyExistsError()
    }

    const passwordHash = await hash(payload.password, 10)
    const user = await this.usersRepository.create({
      name: payload.name.trim(),
      email: payload.email.trim().toLowerCase(),
      passwordHash,
      role: payload.role,
      isActive: true,
    })

    return mapStoredUserToAuthUser(user)
  }
}

export class AuthenticateUserUseCase {
  constructor(private readonly usersRepository: UsersRepository) {}

  async execute(email: string, password: string): Promise<AuthUser> {
    const validation = validateLogin({ email, password })
    if (!validation.valid) {
      throw new ValidationError(validation.errors)
    }

    const user = await this.usersRepository.findByEmail(email)
    if (!user) {
      throw new InvalidCredentialsError()
    }

    if (!user.isActive) {
      throw new AccountDeactivatedError()
    }

    const { compare } = await import('bcryptjs')
    const valid = await compare(password, user.passwordHash)
    if (!valid) {
      throw new InvalidCredentialsError()
    }

    return mapStoredUserToAuthUser(user)
  }
}

export class GetCurrentUserUseCase {
  constructor(private readonly usersRepository: UsersRepository) {}

  async execute(userId: string): Promise<AuthUser> {
    const user = await this.usersRepository.findById(userId)
    if (!user) {
      throw new InvalidCredentialsError()
    }

    return mapStoredUserToAuthUser(user)
  }
}

export class CreateSessionUseCase {
  constructor(private readonly sessionsRepository: SessionsRepository) {}

  async execute(userId: string, token: string, impersonatorUserId?: string): Promise<void> {
    await this.sessionsRepository.create(userId, token, impersonatorUserId)
  }
}

export class DestroySessionUseCase {
  constructor(private readonly sessionsRepository: SessionsRepository) {}

  async execute(token: string): Promise<void> {
    await this.sessionsRepository.deleteByToken(token)
  }
}

export class ResolveSessionUseCase {
  constructor(
    private readonly sessionsRepository: SessionsRepository,
    private readonly usersRepository: UsersRepository,
  ) {}

  async execute(token: string | undefined): Promise<AuthUser | null> {
    if (!token) return null

    const session = await this.sessionsRepository.findByToken(token)
    if (!session) return null

    const user = await this.usersRepository.findById(session.userId)
    if (!user || !user.isActive) return null

    return mapStoredUserToAuthUser(user, {
      impersonatorUserId: session.impersonatorUserId,
    })
  }
}
