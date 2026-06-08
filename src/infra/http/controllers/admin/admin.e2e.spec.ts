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

  it('GET /api/admin/users/:id returns user profile detail', async () => {
    const login = await request(app.server)
      .post('/api/admin/auth/login')
      .send({ email: 'admin-test@fataltrainer.com', password: 'Admin@Fatal2026!' })

    const cookie = login.headers['set-cookie']
    const list = await request(app.server)
      .get('/api/admin/users')
      .set('Cookie', cookie!)

    const userId = list.body.items[0].id

    const detail = await request(app.server)
      .get(`/api/admin/users/${userId}`)
      .set('Cookie', cookie!)

    expect(detail.statusCode).toBe(200)
    expect(detail.body.user.id).toBe(userId)
    expect(detail.body.user.notesCount).toBeDefined()
    expect(detail.body.user.activityCount).toBeDefined()

    const activity = await request(app.server)
      .get(`/api/admin/users/${userId}/activity`)
      .set('Cookie', cookie!)

    expect(activity.statusCode).toBe(200)
    expect(activity.body.items).toBeDefined()

    const notes = await request(app.server)
      .get(`/api/admin/users/${userId}/notes`)
      .set('Cookie', cookie!)

    expect(notes.statusCode).toBe(200)
    expect(notes.body.items).toBeDefined()
  })
})
