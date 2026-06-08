import { describe, expect, it } from 'vitest'
import {
  ConflictError,
  ResourceNotFoundError,
  ValidationError,
} from '@/domain/shared/errors/domain-errors'
import { InMemoryPromotionTemplatesRepository } from '@/utils/tests/repositories/in-memory-promotion-templates-repository'
import {
  CreatePromotionTemplateUseCase,
  DeletePromotionTemplateUseCase,
  ListPromotionTemplatesUseCase,
  UpdatePromotionTemplateUseCase,
} from './admin-promotion-templates-use-cases'

describe('Admin promotion templates use cases', () => {
  it('creates and lists promotion templates', async () => {
    const repository = new InMemoryPromotionTemplatesRepository()
    const create = new CreatePromotionTemplateUseCase(repository)
    const list = new ListPromotionTemplatesUseCase(repository)

    const created = await create.execute({
      name: 'Black Friday',
      label: 'Black Friday',
      discountPercent: 20,
      startsAt: '2026-01-01',
      endsAt: '2026-12-31',
      maxRedemptions: 10,
    })

    const result = await list.execute({ page: 1, pageSize: 10 })

    expect(result.total).toBe(1)
    expect(result.items[0]?.id).toBe(created.id)
    expect(result.items[0]?.activationCount).toBe(0)
  })

  it('rejects invalid template payloads', async () => {
    const repository = new InMemoryPromotionTemplatesRepository()
    const create = new CreatePromotionTemplateUseCase(repository)

    await expect(
      create.execute({
        name: '',
        label: '',
        discountPercent: 2,
        startsAt: '2026-12-31',
        endsAt: '2026-01-01',
        maxRedemptions: null,
      }),
    ).rejects.toBeInstanceOf(ValidationError)
  })

  it('updates and deletes templates without activations', async () => {
    const repository = new InMemoryPromotionTemplatesRepository()
    const create = new CreatePromotionTemplateUseCase(repository)
    const update = new UpdatePromotionTemplateUseCase(repository)
    const remove = new DeletePromotionTemplateUseCase(repository)

    const created = await create.execute({
      name: 'Launch',
      label: 'Oferta de lançamento',
      discountPercent: 15,
      startsAt: '2026-01-01',
      endsAt: '2026-12-31',
    })

    const updated = await update.execute(created.id, { isActive: false })
    expect(updated.isActive).toBe(false)

    await expect(remove.execute(created.id)).resolves.toBeUndefined()
    await expect(remove.execute(created.id)).rejects.toBeInstanceOf(ResourceNotFoundError)
  })

  it('blocks delete when template has activations', async () => {
    const repository = new InMemoryPromotionTemplatesRepository()
    const create = new CreatePromotionTemplateUseCase(repository)
    const remove = new DeletePromotionTemplateUseCase(repository)

    const created = await create.execute({
      name: 'Primeira sessão',
      label: 'Primeira sessão',
      discountPercent: 20,
      startsAt: '2026-01-01',
      endsAt: '2026-12-31',
    })

    repository.activations.set(created.id, 2)

    await expect(remove.execute(created.id)).rejects.toBeInstanceOf(ConflictError)
  })
})
