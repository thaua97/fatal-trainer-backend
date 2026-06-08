import { z } from 'zod'
import { REPORT_TYPES } from '@/domain/reports/enterprise/constants/report-options'

export const loginSchema = z.object({
  email: z.string(),
  password: z.string(),
})

export const listUsersSchema = z.object({
  page: z.coerce.number().min(1).default(1),
  pageSize: z.coerce.number().min(1).max(100).default(20),
  search: z.string().optional(),
  role: z.enum(['student', 'personal-trainer', 'admin']).optional(),
  isActive: z.coerce.boolean().optional(),
})

export const createUserSchema = z.object({
  name: z.string(),
  email: z.string(),
  password: z.string(),
  role: z.enum(['student', 'personal-trainer', 'admin']),
  phoneNumber: z.string().optional(),
})

export const updateUserSchema = z.object({
  name: z.string().optional(),
  email: z.string().optional(),
  role: z.enum(['student', 'personal-trainer', 'admin']).optional(),
  isActive: z.boolean().optional(),
  phoneNumber: z.string().optional(),
})

export const toggleFeaturedSchema = z.object({
  featured: z.boolean(),
})

export const listRecentAccessSchema = z.object({
  limit: z.coerce.number().min(1).max(20).default(8),
})

export const listActivitySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  pageSize: z.coerce.number().min(1).max(50).default(10),
})

export const createNoteSchema = z.object({
  content: z.string().min(1),
})

export const listReportsSchema = z.object({
  page: z.coerce.number().min(1).default(1),
  pageSize: z.coerce.number().min(1).max(100).default(20),
  status: z.enum(['pending', 'in_review', 'resolved', 'archived']).optional(),
  type: z.enum(REPORT_TYPES).optional(),
})

export const updateReportSchema = z.object({
  status: z.enum(['pending', 'in_review', 'resolved', 'archived']),
})

export const listPromotionsSchema = z.object({
  page: z.coerce.number().min(1).default(1),
  pageSize: z.coerce.number().min(1).max(100).default(20),
  search: z.string().optional(),
  isActive: z.coerce.boolean().optional(),
  status: z.enum(['active', 'upcoming', 'expired']).optional(),
})

export const createPromotionSchema = z.object({
  name: z.string(),
  label: z.string(),
  discountPercent: z.number(),
  startsAt: z.string(),
  endsAt: z.string(),
  maxRedemptions: z.number().nullable().optional(),
  isActive: z.boolean().optional(),
})

export const updatePromotionSchema = z.object({
  name: z.string().optional(),
  label: z.string().optional(),
  discountPercent: z.number().optional(),
  startsAt: z.string().optional(),
  endsAt: z.string().optional(),
  maxRedemptions: z.number().nullable().optional(),
  isActive: z.boolean().optional(),
})
