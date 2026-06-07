import { describe, expect, it } from 'vitest'
import { Readable } from 'node:stream'
import { ValidationError } from '@/domain/shared/errors/domain-errors'
import {
  assertFileSizeWithinLimit,
  assertGalleryHasCapacity,
  MAX_GALLERY_IMAGES,
  MAX_IMAGE_FILE_SIZE_BYTES,
  validateGalleryUploadFile,
} from './image-upload-validator'

describe('image-upload-validator', () => {
  it('accepts allowed mime types', () => {
    expect(() =>
      validateGalleryUploadFile({
        filename: 'a.jpg',
        mimetype: 'image/jpeg',
        file: Readable.from([]),
      }),
    ).not.toThrow()
  })

  it('rejects invalid mime types', () => {
    expect(() =>
      validateGalleryUploadFile({
        filename: 'a.gif',
        mimetype: 'image/gif',
        file: Readable.from([]),
      }),
    ).toThrow(ValidationError)
  })

  it('rejects gallery at capacity', () => {
    expect(() => assertGalleryHasCapacity(MAX_GALLERY_IMAGES)).toThrow(ValidationError)
    expect(() => assertGalleryHasCapacity(MAX_GALLERY_IMAGES - 1)).not.toThrow()
  })

  it('rejects files over size limit', () => {
    expect(() => assertFileSizeWithinLimit(MAX_IMAGE_FILE_SIZE_BYTES + 1)).toThrow(ValidationError)
    expect(() => assertFileSizeWithinLimit(MAX_IMAGE_FILE_SIZE_BYTES)).not.toThrow()
  })
})
