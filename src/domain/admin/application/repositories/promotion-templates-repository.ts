import type {
  AdminPromotionListQuery,
  AdminPromotionListResult,
  AdminPromotionTemplateListItem,
  CreatePromotionTemplatePayload,
  PromotionTemplateRecord,
  UpdatePromotionTemplatePayload,
} from '../../enterprise/entities/admin-promotion-template'

export interface PromotionTemplatesRepository {
  findMany(query: AdminPromotionListQuery): Promise<AdminPromotionListResult>
  findById(id: string): Promise<PromotionTemplateRecord | null>
  findByIds(ids: string[]): Promise<PromotionTemplateRecord[]>
  findAvailableForTrainer(referenceDate?: string): Promise<PromotionTemplateRecord[]>
  create(payload: CreatePromotionTemplatePayload): Promise<AdminPromotionTemplateListItem>
  update(id: string, payload: UpdatePromotionTemplatePayload): Promise<AdminPromotionTemplateListItem>
  delete(id: string): Promise<void>
  countActivations(templateId: string): Promise<number>
}
