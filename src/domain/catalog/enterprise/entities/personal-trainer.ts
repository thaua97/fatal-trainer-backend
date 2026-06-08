export type TrainerModality = 'presencial' | 'online' | 'hibrido'

export interface TrainerPromotion {
  templateId?: string
  discountPercent?: number
  promoPrice: number
  label?: string
  startsAt?: string
  endsAt?: string
  maxRedemptions?: number
  redemptionCount?: number
}

export interface TrainerReview {
  author: string
  rating: number
  comment: string
}

export interface PersonalTrainerProps {
  name: string
  profession: string
  description: string
  photoUrl: string
  servicePrice: number
  userId?: string
  contactPhone?: string
  rating?: number
  reviewCount?: number
  distanceKm?: number
  city?: string
  state?: string
  specialties?: string[]
  modalities?: TrainerModality[]
  cref?: string
  gallery?: string[]
  availability?: string
  experienceYears?: number
  reviews?: TrainerReview[]
  featured?: boolean
  promotion?: TrainerPromotion
  isActive?: boolean
}

export class PersonalTrainer {
  private constructor(
    public readonly id: string,
    public props: PersonalTrainerProps,
  ) {}

  static create(props: PersonalTrainerProps, id?: string): PersonalTrainer {
    return new PersonalTrainer(id ?? crypto.randomUUID(), props)
  }

  static restore(id: string, props: PersonalTrainerProps): PersonalTrainer {
    return new PersonalTrainer(id, props)
  }

  get name(): string {
    return this.props.name
  }

  get userId(): string | undefined {
    return this.props.userId
  }

  toJSON() {
    return {
      id: this.id,
      userId: this.props.userId,
      name: this.props.name,
      profession: this.props.profession,
      description: this.props.description,
      photoUrl: this.props.photoUrl,
      servicePrice: this.props.servicePrice,
      contactPhone: this.props.contactPhone,
      rating: this.props.rating,
      reviewCount: this.props.reviewCount,
      distanceKm: this.props.distanceKm,
      city: this.props.city,
      state: this.props.state,
      specialties: this.props.specialties,
      modalities: this.props.modalities,
      cref: this.props.cref,
      gallery: this.props.gallery,
      availability: this.props.availability,
      experienceYears: this.props.experienceYears,
      reviews: this.props.reviews,
      featured: this.props.featured,
      promotion: this.props.promotion,
      isActive: this.props.isActive ?? true,
    }
  }
}
