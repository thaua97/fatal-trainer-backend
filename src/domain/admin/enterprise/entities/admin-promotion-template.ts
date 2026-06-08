export type PromotionTemplateStatus = 'active' | 'upcoming' | 'expired'

export interface AdminPromotionTemplateListItem {
  id: string
  name: string
  label: string
  discountPercent: number
  startsAt: string
  endsAt: string
  maxRedemptions?: number
  isActive: boolean
  activationCount: number
  createdAt: string
}

export interface AdminPromotionListQuery {
  page: number
  pageSize: number
  search?: string
  isActive?: boolean
  status?: PromotionTemplateStatus
}

export interface AdminPromotionListResult {
  items: AdminPromotionTemplateListItem[]
  total: number
  page: number
  pageSize: number
  hasMore: boolean
}

export interface CreatePromotionTemplatePayload {
  name: string
  label: string
  discountPercent: number
  startsAt: string
  endsAt: string
  maxRedemptions?: number | null
  isActive?: boolean
}

export interface UpdatePromotionTemplatePayload {
  name?: string
  label?: string
  discountPercent?: number
  startsAt?: string
  endsAt?: string
  maxRedemptions?: number | null
  isActive?: boolean
}

export interface PromotionTemplateRecord {
  id: string
  name: string
  label: string
  discountPercent: number
  startsAt: string
  endsAt: string
  maxRedemptions?: number
  isActive: boolean
  createdAt: string
  updatedAt: string
}
