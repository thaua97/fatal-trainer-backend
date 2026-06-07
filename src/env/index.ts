import 'dotenv/config'
import { z } from 'zod'

function optionalEnvString() {
  return z.preprocess(
    (value) => (typeof value === 'string' && value.trim() === '' ? undefined : value),
    z.string().optional(),
  )
}

function optionalEnvUrl() {
  return z.preprocess(
    (value) => (typeof value === 'string' && value.trim() === '' ? undefined : value),
    z.string().url().optional(),
  )
}

const envSchema = z
  .object({
    NODE_ENV: z.enum(['dev', 'test', 'prod']).default('dev'),
    DATABASE_URL: z.string(),
    PORT: z.coerce.number().default(3333),
    JWT_SECRET: z.string(),
    UPLOAD_DIR: z.string().default('./uploads'),
    STORAGE_DRIVER: z.enum(['local', 's3']).default('local'),
    AWS_REGION: optionalEnvString(),
    AWS_S3_BUCKET: optionalEnvString(),
    AWS_ACCESS_KEY_ID: optionalEnvString(),
    AWS_SECRET_ACCESS_KEY: optionalEnvString(),
    CDN_BASE_URL: optionalEnvUrl(),
  })
  .superRefine((data, ctx) => {
    if (data.STORAGE_DRIVER !== 's3') {
      return
    }

    if (!data.AWS_REGION) {
      ctx.addIssue({
        code: 'custom',
        path: ['AWS_REGION'],
        message: 'AWS_REGION is required when STORAGE_DRIVER=s3',
      })
    }

    if (!data.AWS_S3_BUCKET) {
      ctx.addIssue({
        code: 'custom',
        path: ['AWS_S3_BUCKET'],
        message: 'AWS_S3_BUCKET is required when STORAGE_DRIVER=s3',
      })
    }

    if (!data.CDN_BASE_URL) {
      ctx.addIssue({
        code: 'custom',
        path: ['CDN_BASE_URL'],
        message: 'CDN_BASE_URL is required when STORAGE_DRIVER=s3',
      })
    }
  })

const parsed = envSchema.safeParse(process.env)

if (!parsed.success) {
  console.error('Invalid environment variables', parsed.error.format())
  throw new Error('Invalid environment variables')
}

export const env = parsed.data
