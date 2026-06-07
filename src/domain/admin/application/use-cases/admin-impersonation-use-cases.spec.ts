import { describe, expect, it } from 'vitest'
import { ForbiddenError, ResourceNotFoundError } from '@/domain/shared/errors/domain-errors'
import { ImpersonateUserUseCase } from '@/domain/admin/application/use-cases/admin-users-use-cases'
import { ListRecentImpersonationAccessUseCase } from '@/domain/admin/application/use-cases/admin-impersonation-use-cases'
import { InMemoryAdminUsersRepository } from '@/utils/tests/repositories/in-memory-admin-users-repository'
import { InMemoryAdminImpersonationLogsRepository } from '@/utils/tests/repositories/in-memory-admin-impersonation-logs-repository'

describe('ImpersonateUserUseCase', () => {
  it('creates impersonation log and returns auth user', async () => {
    const usersRepo = new InMemoryAdminUsersRepository([{
      id: 'target-1',
      name: 'Carlos Personal',
      email: 'personal@test.com',
      role: 'personal-trainer',
      servicePrice: 100,
      promoPrice: 80,
      isActive: true,
      featured: false,
      createdAt: '2026-06-06T00:00:00.000Z',
    }])
    const logsRepo = new InMemoryAdminImpersonationLogsRepository()
    const useCase = new ImpersonateUserUseCase(usersRepo, logsRepo)

    const result = await useCase.execute('admin-1', 'target-1')

    expect(result.id).toBe('target-1')
    expect(result.isImpersonating).toBe(true)
    expect(logsRepo.items).toHaveLength(1)
    expect(logsRepo.items[0]?.targetName).toBe('Carlos Personal')
    expect(logsRepo.items[0]?.targetRole).toBe('personal-trainer')
  })

  it('rejects inactive users', async () => {
    const usersRepo = new InMemoryAdminUsersRepository([{
      id: 'target-1',
      name: 'Inactive',
      email: 'inactive@test.com',
      role: 'student',
      isActive: false,
      featured: false,
      createdAt: '2026-06-06T00:00:00.000Z',
    }])
    const logsRepo = new InMemoryAdminImpersonationLogsRepository()
    const useCase = new ImpersonateUserUseCase(usersRepo, logsRepo)

    await expect(useCase.execute('admin-1', 'target-1')).rejects.toBeInstanceOf(ForbiddenError)
    expect(logsRepo.items).toHaveLength(0)
  })

  it('throws when user not found', async () => {
    const useCase = new ImpersonateUserUseCase(
      new InMemoryAdminUsersRepository(),
      new InMemoryAdminImpersonationLogsRepository(),
    )

    await expect(useCase.execute('admin-1', 'missing')).rejects.toBeInstanceOf(ResourceNotFoundError)
  })
})

describe('ListRecentImpersonationAccessUseCase', () => {
  it('returns recent access items for admin', async () => {
    const logsRepo = new InMemoryAdminImpersonationLogsRepository()
    await logsRepo.create({
      adminUserId: 'admin-1',
      targetUserId: 'u1',
      targetName: 'Ana',
      targetRole: 'student',
    })

    const useCase = new ListRecentImpersonationAccessUseCase(logsRepo)
    const items = await useCase.execute('admin-1', 8)

    expect(items).toHaveLength(1)
    expect(items[0]?.targetName).toBe('Ana')
  })
})
