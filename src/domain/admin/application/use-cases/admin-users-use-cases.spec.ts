import { describe, expect, it } from 'vitest'
import { ForbiddenError, InvalidCredentialsError, ResourceNotFoundError } from '@/domain/shared/errors/domain-errors'
import { AdminLoginUseCase, DeleteAdminUserUseCase } from '@/domain/admin/application/use-cases/admin-users-use-cases'
import { InMemoryUsersRepository } from '@/utils/tests/repositories/in-memory-users-repository'
import { InMemoryAdminUsersRepository } from '@/utils/tests/repositories/in-memory-admin-users-repository'
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

describe('DeleteAdminUserUseCase', () => {
  const baseUser = {
    name: 'Student',
    email: 'student@test.com',
    role: 'student' as const,
    isActive: true,
    featured: false,
    createdAt: '2026-06-06T00:00:00.000Z',
  }

  it('throws ForbiddenError when admin tries to delete themselves', async () => {
    const repo = new InMemoryAdminUsersRepository([{ id: 'admin-1', ...baseUser, role: 'admin' }])
    const useCase = new DeleteAdminUserUseCase(repo)
    await expect(useCase.execute('admin-1', 'admin-1')).rejects.toBeInstanceOf(ForbiddenError)
  })

  it('throws ResourceNotFoundError when user does not exist', async () => {
    const repo = new InMemoryAdminUsersRepository()
    const useCase = new DeleteAdminUserUseCase(repo)
    await expect(useCase.execute('admin-1', 'missing')).rejects.toBeInstanceOf(ResourceNotFoundError)
  })

  it('calls repository.delete on valid target', async () => {
    const repo = new InMemoryAdminUsersRepository([
      { id: 'admin-1', ...baseUser, role: 'admin' },
      { id: 'user-2', ...baseUser },
    ])
    const useCase = new DeleteAdminUserUseCase(repo)
    await useCase.execute('admin-1', 'user-2')
    expect(await repo.findById('user-2')).toBeNull()
  })
})
