import { describe, expect, it } from 'vitest'
import {
  CreateSessionUseCase,
  DestroySessionUseCase,
  GetCurrentUserUseCase,
} from './auth-use-cases'
import {
  InMemorySessionsRepository,
  InMemoryUsersRepository,
} from '@/utils/tests/repositories/in-memory-users-repository'

describe('Additional auth use cases', () => {
  it('creates and destroys sessions', async () => {
    const sessions = new InMemorySessionsRepository()
    const create = new CreateSessionUseCase(sessions)
    await create.execute('user-1', 'token-1')

    const destroy = new DestroySessionUseCase(sessions)
    await destroy.execute('token-1')

    expect(sessions.sessions.size).toBe(0)
  })

  it('gets current user', async () => {
    const users = new InMemoryUsersRepository()
    users.items.push({
      id: 'user-1',
      name: 'Ana',
      email: 'ana@example.com',
      passwordHash: 'hash',
      role: 'student',
      isActive: true,
    })

    const sut = new GetCurrentUserUseCase(users)
    const user = await sut.execute('user-1')
    expect(user.email).toBe('ana@example.com')
  })
})
