import type { PromotionTemplatesRepository } from '@/domain/admin/application/repositories/promotion-templates-repository'
import type {
  AdminPromotionListQuery,
  AdminPromotionListResult,
  AdminPromotionTemplateListItem,
  CreatePromotionTemplatePayload,
  PromotionTemplateRecord,
  UpdatePromotionTemplatePayload,
} from '@/domain/admin/enterprise/entities/admin-promotion-template'

function todayIsoDate(): string {
  return new Date().toISOString().slice(0, 10)
}

function matchesStatus(
  record: PromotionTemplateRecord,
  status: AdminPromotionListQuery['status'],
): boolean {
  if (!status) return true

  const today = todayIsoDate()

  if (status === 'active') {
    return record.isActive && record.startsAt <= today && record.endsAt >= today
  }

  if (status === 'upcoming') {
    return record.isActive && record.startsAt > today
  }

  return record.endsAt < today || !record.isActive
}

export class InMemoryPromotionTemplatesRepository implements PromotionTemplatesRepository {
  public items: PromotionTemplateRecord[] = []
  public activations = new Map<string, number>()

  async findMany(query: AdminPromotionListQuery): Promise<AdminPromotionListResult> {
    let filtered = [...this.items]

    if (query.search) {
      const search = query.search.toLowerCase()
      filtered = filtered.filter(
        (item) =>
          item.name.toLowerCase().includes(search) ||
          item.label.toLowerCase().includes(search),
      )
    }

    if (query.isActive !== undefined) {
      filtered = filtered.filter((item) => item.isActive === query.isActive)
    }

    if (query.status) {
      filtered = filtered.filter((item) => matchesStatus(item, query.status))
    }

    const total = filtered.length
    const start = (query.page - 1) * query.pageSize
    const pageItems = filtered.slice(start, start + query.pageSize)

    const items: AdminPromotionTemplateListItem[] = await Promise.all(
      pageItems.map(async (item) => ({
        ...item,
        activationCount: await this.countActivations(item.id),
      })),
    )

    return {
      items,
      total,
      page: query.page,
      pageSize: query.pageSize,
      hasMore: query.page * query.pageSize < total,
    }
  }

  async findById(id: string): Promise<PromotionTemplateRecord | null> {
    return this.items.find((item) => item.id === id) ?? null
  }

  async findByIds(ids: string[]): Promise<PromotionTemplateRecord[]> {
    const byId = new Map(this.items.map((item) => [item.id, item]))
    return ids.map((id) => byId.get(id)).filter((item): item is PromotionTemplateRecord => Boolean(item))
  }

  async findAvailableForTrainer(referenceDate = todayIsoDate()): Promise<PromotionTemplateRecord[]> {
    return this.items.filter(
      (item) => item.isActive && item.endsAt >= referenceDate,
    )
  }

  async create(payload: CreatePromotionTemplatePayload): Promise<AdminPromotionTemplateListItem> {
    const record: PromotionTemplateRecord = {
      id: crypto.randomUUID(),
      name: payload.name.trim(),
      label: payload.label.trim(),
      discountPercent: payload.discountPercent,
      startsAt: payload.startsAt,
      endsAt: payload.endsAt,
      maxRedemptions: payload.maxRedemptions ?? undefined,
      isActive: payload.isActive ?? true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    this.items.push(record)

    return {
      ...record,
      activationCount: 0,
    }
  }

  async update(
    id: string,
    payload: UpdatePromotionTemplatePayload,
  ): Promise<AdminPromotionTemplateListItem> {
    const current = await this.findById(id)
    if (!current) throw new Error('Template not found')

    const updated: PromotionTemplateRecord = {
      ...current,
      ...(payload.name !== undefined ? { name: payload.name.trim() } : {}),
      ...(payload.label !== undefined ? { label: payload.label.trim() } : {}),
      ...(payload.discountPercent !== undefined
        ? { discountPercent: payload.discountPercent }
        : {}),
      ...(payload.startsAt !== undefined ? { startsAt: payload.startsAt } : {}),
      ...(payload.endsAt !== undefined ? { endsAt: payload.endsAt } : {}),
      ...(payload.maxRedemptions !== undefined
        ? { maxRedemptions: payload.maxRedemptions ?? undefined }
        : {}),
      ...(payload.isActive !== undefined ? { isActive: payload.isActive } : {}),
      updatedAt: new Date().toISOString(),
    }

    const index = this.items.findIndex((item) => item.id === id)
    this.items[index] = updated

    return {
      ...updated,
      activationCount: await this.countActivations(id),
    }
  }

  async delete(id: string): Promise<void> {
    this.items = this.items.filter((item) => item.id !== id)
  }

  async countActivations(templateId: string): Promise<number> {
    return this.activations.get(templateId) ?? 0
  }
}
