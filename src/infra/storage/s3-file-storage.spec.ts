import { Readable } from 'node:stream'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { DeleteObjectCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3'
import { ValidationError } from '@/domain/shared/errors/domain-errors'
import { S3FileStorage } from './s3-file-storage'

vi.mock('@/env', () => ({
  env: {
    AWS_REGION: 'us-east-1',
    AWS_S3_BUCKET: 'test-bucket',
    CDN_BASE_URL: 'https://cdn.example.com',
  },
}))

describe('S3FileStorage', () => {
  let send: ReturnType<typeof vi.fn>
  let storage: S3FileStorage

  beforeEach(() => {
    send = vi.fn().mockResolvedValue({})
    storage = new S3FileStorage({ send } as unknown as S3Client)
  })

  it('uploads with PutObjectCommand and returns CDN URL', async () => {
    const url = await storage.saveGalleryImage('trainer-1', {
      filename: 'photo.jpg',
      mimetype: 'image/jpeg',
      file: Readable.from(['data']),
    })

    expect(url).toMatch(/^https:\/\/cdn\.example\.com\/trainers\/trainer-1\/.+\.jpg$/)
    expect(send).toHaveBeenCalledOnce()

    const command = send.mock.calls[0]![0] as PutObjectCommand
    expect(command).toBeInstanceOf(PutObjectCommand)
    expect(command.input.Bucket).toBe('test-bucket')
    expect(command.input.Key).toMatch(/^trainers\/trainer-1\/.+\.jpg$/)
    expect(command.input.ContentType).toBe('image/jpeg')
    expect(command.input.CacheControl).toBe('public, max-age=31536000, immutable')
    expect(Buffer.isBuffer(command.input.Body)).toBe(true)
    expect(command.input.ContentLength).toBe(4)
  })

  it('rejects invalid mime types', async () => {
    await expect(
      storage.saveGalleryImage('trainer-1', {
        filename: 'photo.gif',
        mimetype: 'image/gif',
        file: Readable.from(['data']),
      }),
    ).rejects.toBeInstanceOf(ValidationError)
  })

  it('deletes object by CDN URL', async () => {
    await storage.deleteGalleryImage('https://cdn.example.com/trainers/trainer-1/abc.jpg')

    expect(send).toHaveBeenCalledOnce()
    const command = send.mock.calls[0]![0] as DeleteObjectCommand
    expect(command).toBeInstanceOf(DeleteObjectCommand)
    expect(command.input.Key).toBe('trainers/trainer-1/abc.jpg')
  })

  it('ignores external URLs on delete', async () => {
    await storage.deleteGalleryImage('https://images.pexels.com/photo.jpg')
    expect(send).not.toHaveBeenCalled()
  })

  it('resolves object key from CDN and local URLs', () => {
    expect(storage.resolveObjectKeyFromUrl('https://cdn.example.com/trainers/t1/a.jpg')).toBe(
      'trainers/t1/a.jpg',
    )
    expect(storage.resolveObjectKeyFromUrl('/uploads/trainers/t1/a.jpg')).toBe('trainers/t1/a.jpg')
    expect(storage.resolveObjectKeyFromUrl('https://other.cdn/img.jpg')).toBeNull()
  })
})
