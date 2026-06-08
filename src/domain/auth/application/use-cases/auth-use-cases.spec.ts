import { describe, expect, it } from 'vitest'
import { hash } from 'bcryptjs'
import {
  AuthenticateUserUseCase,
  RegisterUserUseCase,
  ResolveSessionUseCase,
} from './auth-use-cases'
import {
  InMemorySessionsRepository,
  InMemoryUsersRepository,
} from '@/utils/tests/repositories/in-memory-users-repository'
import { AccountDeactivatedError, InvalidCredentialsError, UserAlreadyExistsError } from '@/domain/shared/errors/domain-errors'

describe('Auth use cases', () => {
  it('registers and authenticates users', async () => {
    const usersRepository = new InMemoryUsersRepository()
    const register = new RegisterUserUseCase(usersRepository)

    const user = await register.execute({
      name: 'Test User',
      email: 'test@example.com',
      password: '123456',
      confirmPassword: '123456',
      role: 'student',
      termsAccepted: true,
    })

    expect(user.email).toBe('test@example.com')

    const authenticate = new AuthenticateUserUseCase(usersRepository)
    const authenticated = await authenticate.execute('test@example.com', '123456')
    expect(authenticated.id).toBe(user.id)
  })

  it('rejects duplicate registration and invalid login', async () => {
    const usersRepository = new InMemoryUsersRepository()
    usersRepository.items.push({
      id: '1',
      name: 'Existing',
      email: 'exists@example.com',
      passwordHash: await hash('123456', 10),
      role: 'student',
      isActive: true,
    })

    const register = new RegisterUserUseCase(usersRepository)
    await expect(
      register.execute({
        name: 'Other',
        email: 'exists@example.com',
        password: '123456',
        confirmPassword: '123456',
        role: 'student',
        termsAccepted: true,
      }),
    ).rejects.toBeInstanceOf(UserAlreadyExistsError)

    const authenticate = new AuthenticateUserUseCase(usersRepository)
    await expect(authenticate.execute('exists@example.com', 'wrong12')).rejects.toBeInstanceOf(
      InvalidCredentialsError,
    )
  })

  it('rejects inactive users with a dedicated error', async () => {
    const usersRepository = new InMemoryUsersRepository()
    usersRepository.items.push({
      id: 'inactive-1',
      name: 'Inactive User',
      email: 'inactive@example.com',
      passwordHash: await hash('123456', 10),
      role: 'student',
      isActive: false,
    })

    const authenticate = new AuthenticateUserUseCase(usersRepository)
    await expect(authenticate.execute('inactive@example.com', '123456')).rejects.toBeInstanceOf(
      AccountDeactivatedError,
    )
  })

  it('resolves sessions', async () => {
    const usersRepository = new InMemoryUsersRepository()
    const sessionsRepository = new InMemorySessionsRepository()
    usersRepository.items.push({
      id: 'user-1',
      name: 'Ana',
      email: 'ana@example.com',
      passwordHash: 'hash',
      role: 'student',
      isActive: true,
    })

    await sessionsRepository.create('user-1', 'token-1')
    const resolve = new ResolveSessionUseCase(sessionsRepository, usersRepository)

    const user = await resolve.execute('token-1')
    expect(user?.email).toBe('ana@example.com')
    expect(await resolve.execute(undefined)).toBeNull()
  })
})
