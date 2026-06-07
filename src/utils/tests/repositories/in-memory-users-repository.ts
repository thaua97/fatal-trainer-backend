import { randomUUID } from 'node:crypto'
import type { StoredUser } from '@/domain/auth/enterprise/entities/user'
import type {
  SessionsRepository,
  UsersRepository,
} from '@/domain/auth/application/repositories/users-repository'

export class InMemoryUsersRepository implements UsersRepository {
  public items: StoredUser[] = []

  async findByEmail(email: string): Promise<StoredUser | null> {
    const normalized = email.trim().toLowerCase()
    return this.items.find((user) => user.email === normalized) ?? null
  }

  async findById(id: string): Promise<StoredUser | null> {
    return this.items.find((user) => user.id === id) ?? null
  }

  async create(data: Omit<StoredUser, 'id'>): Promise<StoredUser> {
    const user: StoredUser = { ...data, id: randomUUID(), isActive: data.isActive ?? true }
    this.items.push(user)
    return user
  }

  async update(
    id: string,
    data: Partial<Pick<StoredUser, 'name' | 'email' | 'role' | 'isActive' | 'phoneNumber' | 'avatarUrl' | 'city' | 'state'>>,
  ): Promise<StoredUser> {
    const index = this.items.findIndex((user) => user.id === id)
    if (index === -1) {
      throw new Error('User not found')
    }

    const current = this.items[index]!
    const updated: StoredUser = {
      ...current,
      ...data,
      ...(data.name !== undefined && { name: data.name.trim() }),
      ...(data.email !== undefined && { email: data.email.trim().toLowerCase() }),
    }
    this.items[index] = updated
    return updated
  }
}

export class InMemorySessionsRepository implements SessionsRepository {
  public sessions = new Map<string, { userId: string; impersonatorUserId?: string }>()

  async create(userId: string, token: string, impersonatorUserId?: string): Promise<void> {
    this.sessions.set(token, { userId, impersonatorUserId })
  }

  async findByToken(token: string): Promise<{ userId: string; impersonatorUserId?: string } | null> {
    return this.sessions.get(token) ?? null
  }

  async deleteByToken(token: string): Promise<void> {
    this.sessions.delete(token)
  }
}
