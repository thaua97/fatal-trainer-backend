import { describe, expect, it, beforeAll, afterAll } from 'vitest'
import request from 'supertest'
import { hash } from 'bcryptjs'
import { app } from '@/app'
import { prisma } from '@/libs/prisma'

describe('Admin E2E', () => {
  beforeAll(async () => {
    await app.ready()
    await prisma.report.deleteMany()
    await prisma.session.deleteMany()
    await prisma.personalTrainer.deleteMany()
    await prisma.user.deleteMany()

    await prisma.user.create({
      data: {
        name: 'Admin User',
        email: 'admin-test@fataltrainer.com',
        password_hash: await hash('Admin@Fatal2026!', 10),
        role: 'admin',
      },
    })

    await prisma.user.create({
      data: {
        name: 'Student User',
        email: 'student-test@fataltrainer.com',
        password_hash: await hash('123456', 10),
        role: 'student',
      },
    })
  })

  afterAll(async () => {
    await app.close()
  })

  it('POST /api/admin/auth/login rejects non-admin', async () => {
    const response = await request(app.server)
      .post('/api/admin/auth/login')
      .send({ email: 'student-test@fataltrainer.com', password: '123456' })

    expect(response.statusCode).toBe(403)
  })

  it('POST /api/admin/auth/login succeeds for admin', async () => {
    const response = await request(app.server)
      .post('/api/admin/auth/login')
      .send({ email: 'admin-test@fataltrainer.com', password: 'Admin@Fatal2026!' })

    expect(response.statusCode).toBe(200)
    expect(response.body.user.role).toBe('admin')
    expect(response.headers['set-cookie']).toBeDefined()
  })

  it('GET /api/admin/users requires admin session', async () => {
    const login = await request(app.server)
      .post('/api/admin/auth/login')
      .send({ email: 'admin-test@fataltrainer.com', password: 'Admin@Fatal2026!' })

    const cookie = login.headers['set-cookie']
    expect(cookie).toBeDefined()
    const response = await request(app.server)
      .get('/api/admin/users')
      .set('Cookie', cookie!)

    expect(response.statusCode).toBe(200)
    expect(response.body.items).toBeDefined()
    expect(response.body.total).toBeGreaterThan(0)
  })
})
