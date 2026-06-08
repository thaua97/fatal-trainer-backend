import type { PersonalTrainerProps } from '../entities/personal-trainer'
import { CATALOG_SPECIALTIES } from '../constants/catalog-options'

export interface DefaultTrainerProfileInput {
  name: string
  userId: string
  contactPhone?: string
}

const DEFAULT_PHOTO_URL =
  'https://images.pexels.com/photos/1000/pexels-photo.jpeg?auto=compress&cs=tinysrgb&w=400'

export function buildDefaultTrainerProfile(input: DefaultTrainerProfileInput): PersonalTrainerProps {
  const specialty = CATALOG_SPECIALTIES[0]!

  return {
    name: input.name,
    userId: input.userId,
    profession: `Personal Trainer — ${specialty}`,
    description: 'Complete seu perfil para aparecer no catálogo com mais detalhes.',
    photoUrl: DEFAULT_PHOTO_URL,
    servicePrice: 100,
    contactPhone: input.contactPhone?.trim() || '11900000000',
    city: '',
    state: '',
    specialties: [specialty],
    modalities: ['presencial'],
    cref: '',
    gallery: [],
    availability: '',
    experienceYears: 0,
    reviews: [],
    featured: false,
  }
}
