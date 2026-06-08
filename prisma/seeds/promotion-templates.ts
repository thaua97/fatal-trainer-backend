import type { PrismaClient } from '@prisma/client'

const DEFAULT_TEMPLATES = [
  {
    name: 'Primeira sessão',
    label: 'Primeira sessão',
    discount_percent: 20,
    starts_at: new Date('2026-01-01T12:00:00'),
    ends_at: new Date('2026-12-31T12:00:00'),
    max_redemptions: 50,
    is_active: true,
  },
  {
    name: 'Pacote mensal',
    label: 'Pacote mensal',
    discount_percent: 15,
    starts_at: new Date('2026-01-01T12:00:00'),
    ends_at: new Date('2026-12-31T12:00:00'),
    max_redemptions: null,
    is_active: true,
  },
  {
    name: 'Oferta de lançamento',
    label: 'Oferta de lançamento',
    discount_percent: 30,
    starts_at: new Date('2026-01-01T12:00:00'),
    ends_at: new Date('2026-06-30T12:00:00'),
    max_redemptions: 20,
    is_active: true,
  },
]

export async function seedPromotionTemplates(prisma: PrismaClient) {
  await prisma.promotionTemplate.deleteMany()

  await prisma.promotionTemplate.createMany({
    data: DEFAULT_TEMPLATES,
  })

  console.log(`Seeded ${DEFAULT_TEMPLATES.length} promotion templates`)
}
