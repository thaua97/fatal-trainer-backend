import type { UserRole } from '@/domain/auth/enterprise/entities/user'

export interface AdminRecentAccessItem {
  id: string
  targetUserId: string
  targetName: string
  targetRole: UserRole
  accessedAt: string
}

export interface CreateImpersonationLogPayload {
  adminUserId: string
  targetUserId: string
  targetName: string
  targetRole: UserRole
}
