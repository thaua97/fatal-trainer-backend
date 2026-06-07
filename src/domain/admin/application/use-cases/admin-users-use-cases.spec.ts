import { describe, expect, it } from 'vitest'
import { ForbiddenError, InvalidCredentialsError } from '@/domain/shared/errors/domain-errors'
import { AdminLoginUseCase } from '@/domain/admin/application/use-cases/admin-users-use-cases'
import { InMemoryUsersRepository } from '@/utils/tests/repositories/in-memory-users-repository'
import { hash } from 'bcryptjs'

describe('AdminLoginUseCase', () => {
  it('rejects non-admin users', async () => {
    const repo = new InMemoryUsersRepository()
    const passwordHash = await hash('123456', 10)
    await repo.create({
      name: 'Student',
      email: 'student@test.com',
      passwordHash,
      role: 'student',
      isActive: true,
    })

    const useCase = new AdminLoginUseCase(repo)
    await expect(useCase.execute('student@test.com', '123456')).rejects.toBeInstanceOf(ForbiddenError)
  })

  it('authenticates admin users', async () => {
    const repo = new InMemoryUsersRepository()
    const passwordHash = await hash('Admin@Fatal2026!', 10)
    await repo.create({
      name: 'Admin',
      email: 'admin@test.com',
      passwordHash,
      role: 'admin',
      isActive: true,
    })

    const useCase = new AdminLoginUseCase(repo)
    const user = await useCase.execute('admin@test.com', 'Admin@Fatal2026!')
    expect(user.role).toBe('admin')
  })

  it('rejects inactive users', async () => {
    const repo = new InMemoryUsersRepository()
    const passwordHash = await hash('Admin@Fatal2026!', 10)
    await repo.create({
      name: 'Admin',
      email: 'inactive@test.com',
      passwordHash,
      role: 'admin',
      isActive: false,
    })

    const useCase = new AdminLoginUseCase(repo)
    await expect(useCase.execute('inactive@test.com', 'Admin@Fatal2026!')).rejects.toBeInstanceOf(InvalidCredentialsError)
  })
})
