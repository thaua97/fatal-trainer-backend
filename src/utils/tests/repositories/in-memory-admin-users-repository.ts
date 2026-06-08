import type { AdminUsersRepository } from '@/domain/admin/application/repositories/admin-users-repository'
import type {
  AdminUserListItem,
  AdminUserListQuery,
  AdminUserListResult,
  CreateAdminUserPayload,
  UpdateAdminUserPayload,
} from '@/domain/admin/enterprise/entities/admin-user'
import { compareAdminUsersByDefaultOrder } from '@/domain/admin/enterprise/services/sort-admin-users'

export class InMemoryAdminUsersRepository implements AdminUsersRepository {
  constructor(public items: AdminUserListItem[] = []) {}

  async findMany(query: AdminUserListQuery): Promise<AdminUserListResult> {
    let filtered = [...this.items]
    if (query.search) {
      const term = query.search.toLowerCase()
      filtered = filtered.filter(
        user => user.name.toLowerCase().includes(term) || user.email.toLowerCase().includes(term),
      )
    }
    if (query.role) {
      filtered = filtered.filter(user => user.role === query.role)
    }
    if (query.isActive !== undefined) {
      filtered = filtered.filter(user => user.isActive === query.isActive)
    }

    filtered.sort(compareAdminUsersByDefaultOrder)

    const skip = (query.page - 1) * query.pageSize
    const items = filtered.slice(skip, skip + query.pageSize)

    return {
      items,
      total: filtered.length,
      page: query.page,
      pageSize: query.pageSize,
      hasMore: skip + items.length < filtered.length,
    }
  }

  async findById(id: string): Promise<AdminUserListItem | null> {
    return this.items.find(user => user.id === id) ?? null
  }

  async create(_payload: CreateAdminUserPayload, _passwordHash: string): Promise<AdminUserListItem> {
    throw new Error('Not implemented')
  }

  async update(id: string, payload: UpdateAdminUserPayload): Promise<AdminUserListItem> {
    const index = this.items.findIndex(user => user.id === id)
    if (index === -1) throw new Error('User not found')
    this.items[index] = { ...this.items[index]!, ...payload }
    return this.items[index]!
  }

  async toggleFeatured(userId: string, featured: boolean): Promise<AdminUserListItem> {
    const user = await this.findById(userId)
    if (!user) throw new Error('User not found')
    user.featured = featured
    return user
  }

  async emailExists(_email: string, _excludeId?: string): Promise<boolean> {
    return false
  }

  async delete(id: string): Promise<void> {
    this.items = this.items.filter(user => user.id !== id)
  }
}
