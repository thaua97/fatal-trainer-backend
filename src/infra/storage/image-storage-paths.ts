import { extname } from 'node:path'
import { randomUUID } from 'node:crypto'

export const GALLERY_PREFIX = 'trainers'

export function buildGalleryFilename(originalFilename: string): string {
  const extension = extname(originalFilename) || '.jpg'
  return `${randomUUID()}${extension}`
}

export function buildGalleryObjectKey(trainerId: string, filename: string): string {
  return `${GALLERY_PREFIX}/${trainerId}/${filename}`
}

export function buildLocalGalleryUrl(trainerId: string, filename: string): string {
  return `/uploads/${buildGalleryObjectKey(trainerId, filename)}`
}

export function buildCdnGalleryUrl(cdnBaseUrl: string, objectKey: string): string {
  return `${cdnBaseUrl.replace(/\/$/, '')}/${objectKey}`
}
