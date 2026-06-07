import { env } from '@/env'
import type { FileStorage } from '@/domain/catalog/application/storage/file-storage'
import { LocalFileStorage } from '@/infra/storage/local-file-storage'
import { S3FileStorage } from '@/infra/storage/s3-file-storage'

let fileStorage: FileStorage | undefined

export function makeFileStorage(): FileStorage {
  if (!fileStorage) {
    fileStorage = env.STORAGE_DRIVER === 's3' ? new S3FileStorage() : new LocalFileStorage()
  }

  return fileStorage
}

export function resetFileStorageForTests(): void {
  fileStorage = undefined
}
