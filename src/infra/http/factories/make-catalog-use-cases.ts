import { ListPersonalTrainersUseCase } from '@/domain/catalog/application/use-cases/list-personal-trainers'
import { GetPersonalTrainerByIdUseCase } from '@/domain/catalog/application/use-cases/get-personal-trainer-by-id'
import { ListFeaturedTrainersUseCase } from '@/domain/catalog/application/use-cases/list-featured-trainers'
import { GetOrCreateMyTrainerUseCase } from '@/domain/catalog/application/use-cases/get-or-create-my-trainer'
import { UpdateMyTrainerUseCase } from '@/domain/catalog/application/use-cases/update-my-trainer'
import { ResolveMyTrainerUseCase } from '@/domain/catalog/application/use-cases/resolve-my-trainer'
import { UploadMyTrainerGalleryUseCase } from '@/domain/catalog/application/use-cases/upload-my-trainer-gallery'
import {
  DeleteGalleryImageUseCase,
  SetGalleryCoverUseCase,
  UploadGalleryImageUseCase,
} from '@/domain/catalog/application/use-cases/gallery-use-cases'
import {
  AddFavoriteUseCase,
  ListFavoriteTrainersUseCase,
  RemoveFavoriteUseCase,
  SyncFavoritesUseCase,
} from '@/domain/favorites/application/use-cases/favorites-use-cases'
import { CreateReportUseCase } from '@/domain/reports/application/use-cases/create-report'
import { ListTrainerReviewsUseCase } from '@/domain/reviews/application/use-cases/list-trainer-reviews'
import { GetMyTrainerReviewUseCase } from '@/domain/reviews/application/use-cases/get-my-trainer-review'
import { UpsertTrainerReviewUseCase } from '@/domain/reviews/application/use-cases/upsert-trainer-review'
import {
  favoritesRepository,
  promotionTemplatesRepository,
  reportsRepository,
  reviewsRepository,
  trainersRepository,
  usersRepository,
} from './make-repositories'
import { makeFileStorage } from './make-file-storage'

export function makeListPersonalTrainersUseCase() {
  return new ListPersonalTrainersUseCase(trainersRepository)
}

export function makeGetPersonalTrainerByIdUseCase() {
  return new GetPersonalTrainerByIdUseCase(trainersRepository)
}

export function makeListFeaturedTrainersUseCase() {
  return new ListFeaturedTrainersUseCase(trainersRepository)
}

export function makeGetOrCreateMyTrainerUseCase() {
  return new GetOrCreateMyTrainerUseCase(trainersRepository)
}

export function makeResolveMyTrainerUseCase() {
  return new ResolveMyTrainerUseCase(trainersRepository)
}

export function makeUpdateMyTrainerUseCase() {
  return new UpdateMyTrainerUseCase(
    trainersRepository,
    usersRepository,
    promotionTemplatesRepository,
  )
}

export function makeUploadGalleryImageUseCase() {
  return new UploadGalleryImageUseCase(trainersRepository)
}

export function makeUploadMyTrainerGalleryUseCase() {
  return new UploadMyTrainerGalleryUseCase(
    trainersRepository,
    makeFileStorage(),
    makeUploadGalleryImageUseCase(),
  )
}

export function makeDeleteGalleryImageUseCase() {
  return new DeleteGalleryImageUseCase(trainersRepository)
}

export function makeSetGalleryCoverUseCase() {
  return new SetGalleryCoverUseCase(trainersRepository)
}

export function makeListFavoriteTrainersUseCase() {
  return new ListFavoriteTrainersUseCase(favoritesRepository, trainersRepository)
}

export function makeSyncFavoritesUseCase() {
  return new SyncFavoritesUseCase(favoritesRepository)
}

export function makeAddFavoriteUseCase() {
  return new AddFavoriteUseCase(favoritesRepository)
}

export function makeRemoveFavoriteUseCase() {
  return new RemoveFavoriteUseCase(favoritesRepository)
}

export function makeCreateReportUseCase() {
  return new CreateReportUseCase(reportsRepository, trainersRepository)
}

export function makeListTrainerReviewsUseCase() {
  return new ListTrainerReviewsUseCase(reviewsRepository)
}

export function makeGetMyTrainerReviewUseCase() {
  return new GetMyTrainerReviewUseCase(reviewsRepository)
}

export function makeUpsertTrainerReviewUseCase() {
  return new UpsertTrainerReviewUseCase(reviewsRepository, trainersRepository)
}
