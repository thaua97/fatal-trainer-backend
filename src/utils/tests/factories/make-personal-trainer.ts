import type {
  PersonalTrainerProps,
  TrainerModality,
} from '@/domain/catalog/enterprise/entities/personal-trainer'
import { PersonalTrainer } from '@/domain/catalog/enterprise/entities/personal-trainer'
import {
  CATALOG_SPECIALTIES,
  PROMOTION_LABELS,
} from '@/domain/catalog/enterprise/constants/catalog-options'
import {
  pickBrazilianName,
  pickCity,
  pickContactPhone,
} from '../../../../prisma/seeds/seed-data'

const MODALITY_COMBOS: TrainerModality[][] = [
  ['presencial'],
  ['online'],
  ['hibrido'],
  ['presencial', 'online'],
  ['presencial', 'hibrido'],
]

const DESCRIPTIONS = [
  'Personal dedicado a resultados sustentáveis, com foco em técnica e progressão de carga.',
  'Especialista em treinos funcionais para quem busca condicionamento e definição.',
  'Atendimento personalizado para emagrecimento com acompanhamento de hábitos.',
  'Experiência em preparação física para corrida de rua e provas de endurance.',
  'Treinos adaptados para iniciantes, com ênfase em mobilidade e postura.',
  'Abordagem integrada entre força, cardio e recuperação ativa.',
] as const

const AVAILABILITIES = [
  'Seg–Sex, 6h–21h',
  'Seg–Sáb, 7h–20h',
  'Ter–Qui, 8h–18h',
  'Seg–Sex, 6h–12h | Sáb, 8h–14h',
] as const

const REVIEW_COMMENTS = [
  'Excelente profissional, treinos desafiadores e bem explicados.',
  'Muito atencioso e adapta o treino conforme meu dia a dia.',
  'Resultados visíveis em poucas semanas. Recomendo!',
  'Pontual, motivador e sempre disponível para tirar dúvidas.',
] as const

const FEATURED_INDICES = new Set([0, 2, 4, 7, 11, 15])

function padId(index: number): string {
  return `trainer-${String(index + 1).padStart(3, '0')}`
}

function pickSpecialty(index: number): string {
  return CATALOG_SPECIALTIES[index % CATALOG_SPECIALTIES.length]!
}

function getMockAvatarUrl(index: number): string {
  return `https://images.pexels.com/photos/${1000 + (index * 17) % 9000}/pexels-photo.jpeg?auto=compress&cs=tinysrgb&w=400`
}

function getMockGalleryUrls(index: number): string[] {
  return [
    getMockAvatarUrl(index),
    getMockAvatarUrl(index + 1),
    getMockAvatarUrl(index + 2),
  ]
}

function buildPromotion(index: number, servicePrice: number): PersonalTrainerProps['promotion'] {
  if (index % 3 !== 0) return undefined

  const discountFactor = 0.65 + (index % 4) * 0.05
  const promoPrice = Math.round(servicePrice * discountFactor)
  const discountPercent = Math.round((1 - discountFactor) * 100)
  const startsAt = new Date(Date.now() - 3 * 86_400_000).toISOString().slice(0, 10)
  const endsAt = new Date(Date.now() + (index + 14) * 86_400_000).toISOString().slice(0, 10)

  return {
    discountPercent,
    promoPrice,
    label: PROMOTION_LABELS[index % PROMOTION_LABELS.length],
    startsAt,
    endsAt,
    maxRedemptions: 10 + (index % 5) * 5,
    redemptionCount: index % 4,
  }
}

export function makePersonalTrainerProps(index: number): PersonalTrainerProps {
  const specialty = pickSpecialty(index)
  const location = pickCity(index)
  const servicePrice = 80 + (index * 7) % 171

  return {
    name: pickBrazilianName(index),
    profession: `Personal Trainer — ${specialty}`,
    description: DESCRIPTIONS[index % DESCRIPTIONS.length]!,
    photoUrl: getMockAvatarUrl(index),
    servicePrice,
    contactPhone: pickContactPhone(index, location),
    rating: 3.5 + (index % 16) / 10,
    reviewCount: 5 + (index * 13) % 116,
    distanceKm: 1 + (index * 3) % 25,
    city: location.city,
    state: location.state,
    specialties: [specialty, CATALOG_SPECIALTIES[(index + 1) % CATALOG_SPECIALTIES.length]!],
    modalities: MODALITY_COMBOS[index % MODALITY_COMBOS.length]!,
    cref: `${String(100000 + index).slice(0, 6)}-G/${location.state}`,
    gallery: getMockGalleryUrls(index),
    availability: AVAILABILITIES[index % AVAILABILITIES.length],
    experienceYears: 2 + (index % 15),
    reviews: Array.from({ length: (index % 3) + 1 }, (_, reviewIndex) => ({
      author: pickBrazilianName(index + reviewIndex + 1000),
      rating: 4 + ((index + reviewIndex) % 2),
      comment: REVIEW_COMMENTS[(index + reviewIndex) % REVIEW_COMMENTS.length]!,
    })),
    featured: FEATURED_INDICES.has(index),
    promotion: buildPromotion(index, servicePrice),
  }
}

export function makePersonalTrainer(index: number, id?: string): PersonalTrainer {
  return PersonalTrainer.create(makePersonalTrainerProps(index), id ?? padId(index))
}

export function generateMockTrainers(count = 500): PersonalTrainer[] {
  return Array.from({ length: count }, (_, index) => makePersonalTrainer(index))
}
