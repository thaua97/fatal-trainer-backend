import type { AuthUser } from '@/domain/auth/enterprise/entities/user'
import { PersonalTrainer } from '@/domain/catalog/enterprise/entities/personal-trainer'
import type { PersonalTrainersRepository } from '@/domain/catalog/application/repositories/personal-trainers-repository'

export class GetOrCreateMyTrainerUseCase {
  constructor(private readonly trainersRepository: PersonalTrainersRepository) {}

  async execute(user: AuthUser): Promise<{ trainer: PersonalTrainer; created: boolean }> {
    const existing = await this.trainersRepository.findByUserId(user.id)

    if (existing) {
      return { trainer: existing, created: false }
    }

    const trainer = PersonalTrainer.create({
      name: user.name,
      userId: user.id,
      profession: 'Personal Trainer',
      description: 'Complete seu perfil para aparecer no catálogo com mais detalhes.',
      photoUrl: `https://images.pexels.com/photos/${1000 + Math.floor(Math.random() * 9000)}/pexels-photo.jpeg?auto=compress&cs=tinysrgb&w=400`,
      servicePrice: 100,
      contactPhone: user.phoneNumber ?? '',
      city: '',
      state: '',
      specialties: [],
      modalities: [],
      cref: '',
      gallery: [],
      availability: '',
      experienceYears: 0,
      reviews: [],
      featured: false,
    })

    await this.trainersRepository.create(trainer)
    return { trainer, created: true }
  }
}
