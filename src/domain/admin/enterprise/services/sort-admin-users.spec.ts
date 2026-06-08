import { describe, expect, it } from 'vitest'
import {
  adminUserRoleSortPriority,
  compareAdminUsersByDefaultOrder,
} from './sort-admin-users'

describe('sort-admin-users', () => {
  it('prioritizes personal trainers over other roles', () => {
    expect(adminUserRoleSortPriority('personal-trainer')).toBeLessThan(adminUserRoleSortPriority('student'))
    expect(adminUserRoleSortPriority('student')).toBeLessThan(adminUserRoleSortPriority('admin'))
  })

  it('sorts personal trainers before students and admins', () => {
    const users = [
      { id: '1', role: 'admin', createdAt: '2026-06-08T12:00:00.000Z' },
      { id: '2', role: 'student', createdAt: '2026-06-08T11:00:00.000Z' },
      { id: '3', role: 'personal-trainer', createdAt: '2026-06-08T10:00:00.000Z' },
      { id: '4', role: 'personal-trainer', createdAt: '2026-06-08T13:00:00.000Z' },
    ]

    users.sort(compareAdminUsersByDefaultOrder)

    expect(users.map(user => user.id)).toEqual(['4', '3', '2', '1'])
  })
})
