import type { UserRole } from '@/domain/auth/enterprise/entities/user'

export function adminUserRoleSortPriority(role: UserRole | string): number {
  if (role === 'personal-trainer' || role === 'personal_trainer') {
    return 0
  }

  if (role === 'student') {
    return 1
  }

  return 2
}

export function compareAdminUsersByDefaultOrder<T extends { role: string; createdAt: string }>(
  a: T,
  b: T,
): number {
  const roleDiff = adminUserRoleSortPriority(a.role) - adminUserRoleSortPriority(b.role)
  if (roleDiff !== 0) {
    return roleDiff
  }

  return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
}
