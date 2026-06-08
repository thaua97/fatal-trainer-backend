import { prisma } from '@/libs/prisma'
import type { StoredUser } from '@/domain/auth/enterprise/entities/user'
import type {
  SessionsRepository,
  UsersRepository,
} from '@/domain/auth/application/repositories/users-repository'
import { mapRoleToPrismaEnum, mapUserToDomain } from '../mappers/prisma-mapper'

export class PrismaUsersRepository implements UsersRepository {
  async findByEmail(email: string): Promise<StoredUser | null> {
    const user = await prisma.user.findUnique({
      where: { email: email.trim().toLowerCase() },
    })

    return user ? mapUserToDomain(user) : null
  }

  async findById(id: string): Promise<StoredUser | null> {
    const user = await prisma.user.findUnique({ where: { id } })
    return user ? mapUserToDomain(user) : null
  }

  async create(data: Omit<StoredUser, 'id'>): Promise<StoredUser> {
    const user = await prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        password_hash: data.passwordHash,
        role: mapRoleToPrismaEnum(data.role),
        phone_number: data.phoneNumber ?? null,
        avatar_url: data.avatarUrl ?? null,
        city: data.city ?? null,
        state: data.state ?? null,
        is_active: data.isActive ?? true,
      },
    })

    return mapUserToDomain(user)
  }

  async update(
    id: string,
    data: Partial<Pick<StoredUser, 'name' | 'email' | 'role' | 'isActive' | 'phoneNumber' | 'avatarUrl' | 'city' | 'state'>>,
  ): Promise<StoredUser> {
    const user = await prisma.user.update({
      where: { id },
      data: {
        ...(data.name !== undefined && { name: data.name.trim() }),
        ...(data.email !== undefined && { email: data.email.trim().toLowerCase() }),
        ...(data.role !== undefined && { role: mapRoleToPrismaEnum(data.role) }),
        ...(data.isActive !== undefined && { is_active: data.isActive }),
        ...(data.phoneNumber !== undefined && { phone_number: data.phoneNumber || null }),
        ...(data.avatarUrl !== undefined && { avatar_url: data.avatarUrl || null }),
        ...(data.city !== undefined && { city: data.city || null }),
        ...(data.state !== undefined && { state: data.state || null }),
      },
    })

    return mapUserToDomain(user)
  }
}

export class PrismaSessionsRepository implements SessionsRepository {
  async create(userId: string, token: string, impersonatorUserId?: string): Promise<void> {
    await prisma.session.create({
      data: {
        user_id: userId,
        token,
        impersonator_user_id: impersonatorUserId ?? null,
      },
    })
  }

  async findByToken(token: string): Promise<{ userId: string; impersonatorUserId?: string } | null> {
    const session = await prisma.session.findUnique({ where: { token } })
    if (!session) return null
    return {
      userId: session.user_id,
      impersonatorUserId: session.impersonator_user_id ?? undefined,
    }
  }

  async deleteByToken(token: string): Promise<void> {
    await prisma.session.deleteMany({ where: { token } })
  }
}
