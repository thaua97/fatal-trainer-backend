import type { UserRole } from '@/domain/auth/enterprise/entities/user'
import type { AdminUserListItem } from './admin-user'

export type AdminUserActivityType =
  | 'profile_info_edit'
  | 'profile_promotion_edit'
  | 'profile_gallery_edit'
  | 'admin_user_edit'
  | 'admin_featured_toggle'
  | 'admin_impersonation'
  | 'account_login'
  | 'account_register'
  | 'account_deactivated'
  | 'report_received'

export interface AdminUserActivityChange {
  field: string
  label: string
  before: string | null
  after: string | null
}

export interface AdminUserActivityItem {
  id: string
  userId: string
  type: AdminUserActivityType
  title: string
  description?: string
  actorId?: string
  actorName?: string
  actorRole?: UserRole
  changes?: AdminUserActivityChange[]
  metadata?: Record<string, string>
  createdAt: string
}

export interface AdminUserActivityListQuery {
  page: number
  pageSize: number
}

export interface AdminUserActivityListResult {
  items: AdminUserActivityItem[]
  total: number
  page: number
  pageSize: number
  hasMore: boolean
}

export interface AdminUserNote {
  id: string
  userId: string
  authorId: string
  authorName: string
  content: string
  createdAt: string
}

export interface AdminUserDetail extends AdminUserListItem {
  trainer?: Record<string, unknown>
  notesCount: number
  activityCount: number
}

export interface AppendAdminUserActivityPayload {
  userId: string
  type: AdminUserActivityType
  title: string
  description?: string
  actorId?: string
  actorName?: string
  actorRole?: UserRole
  changes?: AdminUserActivityChange[]
  metadata?: Record<string, string>
}
