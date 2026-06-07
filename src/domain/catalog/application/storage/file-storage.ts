import type { Readable } from 'node:stream'

export interface GalleryUploadFile {
  filename: string
  mimetype: string
  file: Readable
}

export interface FileStorage {
  saveGalleryImage(trainerId: string, file: GalleryUploadFile): Promise<string>
  deleteGalleryImage(url: string): Promise<void>
}
