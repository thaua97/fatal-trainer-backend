import { ValidationError } from '@/domain/shared/errors/domain-errors'
import type { GalleryUploadFile } from '../../application/storage/file-storage'

export const MAX_GALLERY_IMAGES = 12
export const MAX_IMAGE_FILE_SIZE_BYTES = 5 * 1024 * 1024

export const ALLOWED_IMAGE_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
] as const

export function assertGalleryHasCapacity(currentCount: number): void {
  if (currentCount >= MAX_GALLERY_IMAGES) {
    throw new ValidationError({ gallery: 'limit' })
  }
}

export function validateGalleryUploadFile(file: GalleryUploadFile): void {
  if (!ALLOWED_IMAGE_MIME_TYPES.includes(file.mimetype as (typeof ALLOWED_IMAGE_MIME_TYPES)[number])) {
    throw new ValidationError({ file: 'invalidType' })
  }
}

export function assertFileSizeWithinLimit(bytes: number | undefined): void {
  if (bytes !== undefined && bytes > MAX_IMAGE_FILE_SIZE_BYTES) {
    throw new ValidationError({ file: 'tooLarge' })
  }
}
