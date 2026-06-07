import type { AuthUser, RegisterPayload, StoredUser } from '../../enterprise/entities/user'

export interface UsersRepository {
  findByEmail(email: string): Promise<StoredUser | null>
  findById(id: string): Promise<StoredUser | null>
  create(data: Omit<StoredUser, 'id'>): Promise<StoredUser>
  update(
    id: string,
    data: Partial<Pick<StoredUser, 'name' | 'email' | 'role' | 'isActive' | 'phoneNumber' | 'avatarUrl' | 'city' | 'state'>>,
  ): Promise<StoredUser>
}

export interface SessionsRepository {
  create(userId: string, token: string, impersonatorUserId?: string): Promise<void>
  findByToken(token: string): Promise<{ userId: string; impersonatorUserId?: string } | null>
  deleteByToken(token: string): Promise<void>
}

export interface AuthUserMapper {
  toAuthUser(user: StoredUser): AuthUser
}
