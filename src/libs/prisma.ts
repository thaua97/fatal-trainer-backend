import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import pg from 'pg'
import { env } from '@/env'

export const schema =
  new URL(env.DATABASE_URL).searchParams.get('schema') || 'public'

const pool = new pg.Pool({ connectionString: env.DATABASE_URL })
const adapter = new PrismaPg(pool, { schema })

export const prisma = new PrismaClient({
  adapter,
  log: env.NODE_ENV === 'dev' ? ['query'] : [],
})
