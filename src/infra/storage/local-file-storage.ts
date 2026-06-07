import { existsSync, mkdirSync, unlinkSync } from 'node:fs'
import { join } from 'node:path'
import { pipeline } from 'node:stream/promises'
import { createWriteStream } from 'node:fs'
import type { FileStorage, GalleryUploadFile } from '@/domain/catalog/application/storage/file-storage'
import { env } from '@/env'
import {
  buildGalleryFilename,
  buildGalleryObjectKey,
  buildLocalGalleryUrl,
} from './image-storage-paths'
import { validateGalleryUploadFile } from './image-upload-validator'

export class LocalFileStorage implements FileStorage {
  private getTrainerDir(trainerId: string) {
    const dir = join(env.UPLOAD_DIR, 'trainers', trainerId)
    if (!existsSync(dir)) {
      mkdirSync(dir, { recursive: true })
    }
    return dir
  }

  async saveGalleryImage(trainerId: string, file: GalleryUploadFile): Promise<string> {
    validateGalleryUploadFile(file)

    const filename = buildGalleryFilename(file.filename)
    const dir = this.getTrainerDir(trainerId)
    const filePath = join(dir, filename)

    await pipeline(file.file, createWriteStream(filePath))

    return buildLocalGalleryUrl(trainerId, filename)
  }

  async deleteGalleryImage(url: string): Promise<void> {
    if (!url.startsWith('/uploads/')) {
      return
    }

    const relativePath = url.replace(/^\/uploads\//, '')
    const filePath = join(env.UPLOAD_DIR, relativePath)

    if (!existsSync(filePath)) {
      return
    }

    unlinkSync(filePath)
  }

  resolveObjectKeyFromUrl(url: string): string | null {
    if (!url.startsWith('/uploads/')) {
      return null
    }

    return url.replace(/^\/uploads\//, '')
  }

  resolveFilePath(objectKey: string): string {
    return join(env.UPLOAD_DIR, objectKey)
  }

  static objectKeyFor(trainerId: string, filename: string): string {
    return buildGalleryObjectKey(trainerId, filename)
  }
}
