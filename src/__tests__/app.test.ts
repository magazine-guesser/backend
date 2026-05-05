import { vi, describe, test, expect } from 'vitest'
import { buildApp } from '../app'

vi.mock('../secrets', () => ({
  getAdminKey: vi.fn().mockResolvedValue('test-secret'),
  resetAdminKey: vi.fn(),
}))

// These tests verify that buildApp() returns a properly configured Fastify instance.
// buildApp() is the shared entry point used by both server.ts (local dev) and lambda.ts (AWS).

describe('buildApp', () => {
  test('returns a Fastify instance with a ready state', async () => {
    const app = buildApp()
    await app.ready()
    expect(app).toBeDefined()
    await app.close()
  })

  test('registers the /health route', async () => {
    const app = buildApp()
    const res = await app.inject({ method: 'GET', url: '/health' })
    expect(res.statusCode).toBe(200)
    await app.close()
  })

  test('registers the /daily route prefix', async () => {
    const app = buildApp()
    // route exists 400/404/200 all confirm it's registered, 404 from express-style fallback means it's NOT there
    const res = await app.inject({ method: 'GET', url: '/daily/2024-01-01' })
    expect(res.statusCode).not.toBe(404)
    await app.close()
  })

  test('registers the /admin route prefix', async () => {
    const app = buildApp()
    const res = await app.inject({ method: 'GET', url: '/admin/magazines/2024-01-01' })
    // 403 means the route exists and the auth guard is working
    expect(res.statusCode).toBe(403)
    await app.close()
  })
})
