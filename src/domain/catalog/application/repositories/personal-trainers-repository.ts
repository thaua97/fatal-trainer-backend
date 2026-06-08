import type { PersonalTrainer } from '../../enterprise/entities/personal-trainer'
import type {
  TrainerInfoPayload,
  TrainerPromotionActivationPayload,
} from '../../enterprise/entities/trainer-profile-payloads'

export interface PaginatedTrainersResult {
  items: PersonalTrainer[]
  total: number
  page: number
  pageSize: number
  hasMore: boolean
}

export interface PersonalTrainersRepository {
  findAll(): Promise<PersonalTrainer[]>
  findById(id: string): Promise<PersonalTrainer | null>
  findByUserId(userId: string): Promise<PersonalTrainer | null>
  findByIds(ids: string[]): Promise<PersonalTrainer[]>
  findFeatured(limit: number): Promise<PersonalTrainer[]>
  create(trainer: PersonalTrainer): Promise<void>
  save(trainer: PersonalTrainer): Promise<void>
  updateInfo(trainerId: string, payload: TrainerInfoPayload): Promise<PersonalTrainer>
  updatePromotion(
    trainerId: string,
    payload: TrainerPromotionActivationPayload,
  ): Promise<PersonalTrainer>
  addGalleryImage(trainerId: string, imageUrl: string): Promise<PersonalTrainer>
  removeGalleryImage(trainerId: string, imageIndex: number): Promise<PersonalTrainer>
  setCoverPhoto(trainerId: string, imageUrl: string): Promise<PersonalTrainer>
}
