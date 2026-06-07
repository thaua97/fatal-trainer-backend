import type { UserRole } from '@/domain/auth/enterprise/entities/user'

export interface AdminUserListItem {
  id: string
  name: string
  email: string
  role: UserRole
  phoneNumber?: string
  avatarUrl?: string
  city?: string
  state?: string
  availability?: string
  servicePrice?: number
  promoPrice?: number
  isActive: boolean
  featured: boolean
  trainerId?: string
  createdAt: string
}

export interface AdminUserListQuery {
  page: number
  pageSize: number
  search?: string
  role?: UserRole
  isActive?: boolean
}

export interface AdminUserListResult {
  items: AdminUserListItem[]
  total: number
  page: number
  pageSize: number
  hasMore: boolean
}

export interface CreateAdminUserPayload {
  name: string
  email: string
  password: string
  role: UserRole
  phoneNumber?: string
}

export interface UpdateAdminUserPayload {
  name?: string
  email?: string
  role?: UserRole
  isActive?: boolean
  phoneNumber?: string
}
