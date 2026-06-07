import { DeleteObjectCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3'
import type { FileStorage, GalleryUploadFile } from '@/domain/catalog/application/storage/file-storage'
import { env } from '@/env'
import {
  buildCdnGalleryUrl,
  buildGalleryFilename,
  buildGalleryObjectKey,
} from './image-storage-paths'
import { validateGalleryUploadFile } from './image-upload-validator'
import { readableToBuffer } from './readable-to-buffer'

const CACHE_CONTROL = 'public, max-age=31536000, immutable'

export class S3FileStorage implements FileStorage {
  private readonly client: S3Client

  constructor(client?: S3Client) {
    this.client =
      client ??
      new S3Client({
        region: env.AWS_REGION,
        ...(env.AWS_ACCESS_KEY_ID && env.AWS_SECRET_ACCESS_KEY
          ? {
              credentials: {
                accessKeyId: env.AWS_ACCESS_KEY_ID,
                secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
              },
            }
          : {}),
      })
  }

  async saveGalleryImage(trainerId: string, file: GalleryUploadFile): Promise<string> {
    validateGalleryUploadFile(file)

    const filename = buildGalleryFilename(file.filename)
    const objectKey = buildGalleryObjectKey(trainerId, filename)
    const body = await readableToBuffer(file.file)

    await this.client.send(
      new PutObjectCommand({
        Bucket: env.AWS_S3_BUCKET,
        Key: objectKey,
        Body: body,
        ContentLength: body.length,
        ContentType: file.mimetype,
        CacheControl: CACHE_CONTROL,
      }),
    )

    return buildCdnGalleryUrl(env.CDN_BASE_URL!, objectKey)
  }

  async deleteGalleryImage(url: string): Promise<void> {
    const objectKey = this.resolveObjectKeyFromUrl(url)
    if (!objectKey) {
      return
    }

    await this.client.send(
      new DeleteObjectCommand({
        Bucket: env.AWS_S3_BUCKET,
        Key: objectKey,
      }),
    )
  }

  resolveObjectKeyFromUrl(url: string): string | null {
    const cdnBase = env.CDN_BASE_URL?.replace(/\/$/, '')
    if (cdnBase && url.startsWith(`${cdnBase}/`)) {
      return url.slice(cdnBase.length + 1)
    }

    if (url.startsWith('/uploads/')) {
      return url.replace(/^\/uploads\//, '')
    }

    return null
  }
}
