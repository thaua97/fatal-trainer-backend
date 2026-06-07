import type { PersonalTrainer } from '@/domain/catalog/enterprise/entities/personal-trainer'
import type { AuthUser, StoredUser } from '../entities/user'

export function mapStoredUserToAuthUser(
  user: StoredUser,
  session?: { impersonatorUserId?: string },
): AuthUser {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    phoneNumber: user.phoneNumber,
    avatarUrl: user.avatarUrl,
    city: user.city,
    state: user.state,
    isActive: user.isActive,
    createdAt: user.createdAt,
    isImpersonating: !!session?.impersonatorUserId,
    impersonatorId: session?.impersonatorUserId,
  }
}

export function enrichAuthUserWithTrainer(
  user: AuthUser,
  trainer?: PersonalTrainer | null,
): AuthUser {
  if (!trainer) {
    return user
  }

  return {
    ...user,
    phoneNumber: user.phoneNumber || trainer.props.contactPhone || undefined,
    avatarUrl: user.avatarUrl || trainer.props.photoUrl || undefined,
    city: user.city || trainer.props.city || undefined,
    state: user.state || trainer.props.state || undefined,
  }
}
