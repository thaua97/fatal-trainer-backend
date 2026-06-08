import { prisma } from '@/libs/prisma'
import type { PromotionTemplate } from '@prisma/client'
import type { PromotionTemplatesRepository } from '@/domain/admin/application/repositories/promotion-templates-repository'
import type {
  AdminPromotionListQuery,
  AdminPromotionListResult,
  AdminPromotionTemplateListItem,
  CreatePromotionTemplatePayload,
  PromotionTemplateRecord,
  UpdatePromotionTemplatePayload,
} from '@/domain/admin/enterprise/entities/admin-promotion-template'
import { formatDateOnly } from '@/domain/catalog/enterprise/services/promotion-hydration'

function mapRecord(record: PromotionTemplate): PromotionTemplateRecord {
  return {
    id: record.id,
    name: record.name,
    label: record.label,
    discountPercent: record.discount_percent,
    startsAt: formatDateOnly(record.starts_at),
    endsAt: formatDateOnly(record.ends_at),
    maxRedemptions: record.max_redemptions ?? undefined,
    isActive: record.is_active,
    createdAt: record.created_at.toISOString(),
    updatedAt: record.updated_at.toISOString(),
  }
}

function todayIsoDate(): string {
  return new Date().toISOString().slice(0, 10)
}

function buildStatusWhere(status: AdminPromotionListQuery['status']) {
  if (!status) return undefined

  const today = new Date(`${todayIsoDate()}T12:00:00`)

  if (status === 'active') {
    return {
      is_active: true,
      starts_at: { lte: today },
      ends_at: { gte: today },
    }
  }

  if (status === 'upcoming') {
    return {
      is_active: true,
      starts_at: { gt: today },
    }
  }

  return {
    OR: [
      { ends_at: { lt: today } },
      { is_active: false },
    ],
  }
}

async function countActivationsForTemplate(templateId: string): Promise<number> {
  return prisma.personalTrainer.count({
    where: {
      promotion: {
        path: ['templateId'],
        equals: templateId,
      },
    },
  })
}

async function mapToListItem(record: PromotionTemplate): Promise<AdminPromotionTemplateListItem> {
  const mapped = mapRecord(record)
  return {
    ...mapped,
    activationCount: await countActivationsForTemplate(record.id),
  }
}

export class PrismaPromotionTemplatesRepository implements PromotionTemplatesRepository {
  async findMany(query: AdminPromotionListQuery): Promise<AdminPromotionListResult> {
    const where: Record<string, unknown> = {}

    if (query.search) {
      where.OR = [
        { name: { contains: query.search, mode: 'insensitive' } },
        { label: { contains: query.search, mode: 'insensitive' } },
      ]
    }

    if (query.isActive !== undefined) {
      where.is_active = query.isActive
    }

    const statusWhere = buildStatusWhere(query.status)
    if (statusWhere) {
      Object.assign(where, statusWhere)
    }

    const total = await prisma.promotionTemplate.count({ where })
    const records = await prisma.promotionTemplate.findMany({
      where,
      orderBy: { created_at: 'desc' },
      skip: (query.page - 1) * query.pageSize,
      take: query.pageSize,
    })

    const items = await Promise.all(records.map(mapToListItem))

    return {
      items,
      total,
      page: query.page,
      pageSize: query.pageSize,
      hasMore: query.page * query.pageSize < total,
    }
  }

  async findById(id: string): Promise<PromotionTemplateRecord | null> {
    const record = await prisma.promotionTemplate.findUnique({ where: { id } })
    return record ? mapRecord(record) : null
  }

  async findByIds(ids: string[]): Promise<PromotionTemplateRecord[]> {
    if (!ids.length) return []

    const records = await prisma.promotionTemplate.findMany({
      where: { id: { in: ids } },
    })

    return records.map(mapRecord)
  }

  async findAvailableForTrainer(referenceDate = todayIsoDate()): Promise<PromotionTemplateRecord[]> {
    const today = new Date(`${referenceDate}T12:00:00`)
    const records = await prisma.promotionTemplate.findMany({
      where: {
        is_active: true,
        ends_at: { gte: today },
      },
      orderBy: { starts_at: 'asc' },
    })

    return records.map(mapRecord)
  }

  async create(payload: CreatePromotionTemplatePayload): Promise<AdminPromotionTemplateListItem> {
    const record = await prisma.promotionTemplate.create({
      data: {
        name: payload.name.trim(),
        label: payload.label.trim(),
        discount_percent: payload.discountPercent,
        starts_at: new Date(`${payload.startsAt}T12:00:00`),
        ends_at: new Date(`${payload.endsAt}T12:00:00`),
        max_redemptions: payload.maxRedemptions ?? null,
        is_active: payload.isActive ?? true,
      },
    })

    return mapToListItem(record)
  }

  async update(
    id: string,
    payload: UpdatePromotionTemplatePayload,
  ): Promise<AdminPromotionTemplateListItem> {
    const record = await prisma.promotionTemplate.update({
      where: { id },
      data: {
        ...(payload.name !== undefined ? { name: payload.name.trim() } : {}),
        ...(payload.label !== undefined ? { label: payload.label.trim() } : {}),
        ...(payload.discountPercent !== undefined
          ? { discount_percent: payload.discountPercent }
          : {}),
        ...(payload.startsAt !== undefined
          ? { starts_at: new Date(`${payload.startsAt}T12:00:00`) }
          : {}),
        ...(payload.endsAt !== undefined
          ? { ends_at: new Date(`${payload.endsAt}T12:00:00`) }
          : {}),
        ...(payload.maxRedemptions !== undefined
          ? { max_redemptions: payload.maxRedemptions }
          : {}),
        ...(payload.isActive !== undefined ? { is_active: payload.isActive } : {}),
      },
    })

    return mapToListItem(record)
  }

  async delete(id: string): Promise<void> {
    await prisma.promotionTemplate.delete({ where: { id } })
  }

  async countActivations(templateId: string): Promise<number> {
    return countActivationsForTemplate(templateId)
  }
}
