import Fastify from 'fastify'
import { vi, beforeEach, describe, test, expect } from 'vitest'
import adminRoute from '../routes/admin'
import { IMagazineRepository, Magazine } from '../types'

const mockMagazine: Magazine = {
  date: '2024-01-01',
  nr: 1,
  identifier: 'test-identifier',
  title: 'Test Magazine',
  year: 1990,
  pageRange: [1, 7],
  redactions: [],
}

const mockRepo: IMagazineRepository = {
  getMagazines: vi.fn().mockResolvedValue([mockMagazine]),
  getMagazine: vi.fn().mockResolvedValue(mockMagazine),
  putMagazines: vi.fn().mockResolvedValue(undefined),
  deleteMagazines: vi.fn().mockResolvedValue(undefined),
  editMagazine: vi.fn().mockResolvedValue({ deleted: mockMagazine, previous: undefined }),
}

const buildApp = () => {
  const app = Fastify()
  app.register(adminRoute, { prefix: '/admin', repo: mockRepo })
  return app
}

beforeEach(() => {
  process.env.ADMIN_KEY = 'test-secret'
  vi.clearAllMocks()
})

describe('Auth', () => {
  test('returns 403 with no authorization header', async () => {
    const app = buildApp()
    const res = await app.inject({ method: 'GET', url: '/admin/magazines/2024-01-01' })
    expect(res.statusCode).toBe(403)
  })

  test('returns 403 with wrong key', async () => {
    const app = buildApp()
    const res = await app.inject({
      method: 'GET',
      url: '/admin/magazines/2024-01-01',
      headers: { authorization: 'wrong-key' },
    })
    expect(res.statusCode).toBe(403)
  })
})

describe('GET /admin/magazines/:date', () => {
  test('returns magazines for the given date', async () => {
    const app = buildApp()
    const res = await app.inject({
      method: 'GET',
      url: '/admin/magazines/2024-01-01',
      headers: { authorization: 'test-secret' },
    })
    expect(res.statusCode).toBe(200)
    expect(res.json()).toEqual([mockMagazine])
    expect(mockRepo.getMagazines).toHaveBeenCalledWith('2024-01-01')
  })
})

describe('PUT /admin/magazines', () => {
  test('calls putMagazines with the request body', async () => {
    const app = buildApp()
    const res = await app.inject({
      method: 'PUT',
      url: '/admin/magazines',
      headers: { authorization: 'test-secret' },
      payload: { magazines: [mockMagazine] },
    })
    expect(res.statusCode).toBe(200)
    expect(mockRepo.putMagazines).toHaveBeenCalledWith([mockMagazine])
  })
})

describe('DELETE /admin/magazines', () => {
  test('calls deleteMagazines with the request body', async () => {
    const app = buildApp()
    const res = await app.inject({
      method: 'DELETE',
      url: '/admin/magazines',
      headers: { authorization: 'test-secret' },
      payload: { magazines: [mockMagazine] },
    })
    expect(res.statusCode).toBe(200)
    expect(mockRepo.deleteMagazines).toHaveBeenCalledWith([mockMagazine])
  })
})

describe('PATCH /admin/magazines/:date/:nr', () => {
  test('calls editMagazine with the correct args and returns old items', async () => {
    const app = buildApp()
    const res = await app.inject({
      method: 'PATCH',
      url: '/admin/magazines/2024-01-01/1',
      headers: { authorization: 'test-secret' },
      payload: { magazine: mockMagazine },
    })
    expect(res.statusCode).toBe(200)
    expect(mockRepo.editMagazine).toHaveBeenCalledWith('2024-01-01', '1', mockMagazine)
    expect(res.json()).toMatchObject({ deleted: mockMagazine })
  })
})
