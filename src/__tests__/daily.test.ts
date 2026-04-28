import Fastify from 'fastify'
import { vi, beforeEach, describe, test, expect } from 'vitest'
import dailyRoute from '../routes/daily'
import { IMagazineRepository, Magazine } from '../types'

const makeMagazine = (overrides: Partial<Magazine> = {}): Magazine => ({
  date: '2024-01-01',
  nr: 1,
  identifier: 'test-mag-001',
  title: 'Test Magazine',
  year: 1990,
  pageRange: [1, 7],
  redactions: [],
  ...overrides,
})

const mag1 = makeMagazine({ nr: 1, year: 1990 })
const mag2 = makeMagazine({ nr: 2, year: 2005 })
const mag3 = makeMagazine({ nr: 3, year: 1975 })

const mockRepo: IMagazineRepository = {
  getMagazines: vi.fn(),
  getMagazine: vi.fn(),
  putMagazines: vi.fn().mockResolvedValue(undefined),
  deleteMagazines: vi.fn().mockResolvedValue(undefined),
  editMagazine: vi.fn(),
}

const buildApp = () => {
  const app = Fastify()
  app.register(dailyRoute, { prefix: '/daily', repo: mockRepo })
  return app
}

beforeEach(() => {
  vi.clearAllMocks()
})

// GET /:date

describe('GET /daily/:date', () => {
  test('returns 3 magazines when repo has all 3', async () => {
    vi.mocked(mockRepo.getMagazines).mockResolvedValue([mag1, mag2, mag3])
    const app = buildApp()
    const res = await app.inject({ method: 'GET', url: '/daily/2024-01-01' })
    expect(res.statusCode).toBe(200)
    expect(res.json()).toHaveLength(3)
  })

  test('strips the year field from every magazine', async () => {
    vi.mocked(mockRepo.getMagazines).mockResolvedValue([mag1, mag2, mag3])
    const app = buildApp()
    const res = await app.inject({ method: 'GET', url: '/daily/2024-01-01' })
    const body = res.json<object[]>()
    body.forEach((mag) => {
      expect(mag).not.toHaveProperty('year')
    })
  })

  test('preserves other fields after stripping year', async () => {
    vi.mocked(mockRepo.getMagazines).mockResolvedValue([mag1])
    const app = buildApp()
    const res = await app.inject({ method: 'GET', url: '/daily/2024-01-01' })
    const [returned] = res.json<object[]>()
    expect(returned).toMatchObject({
      nr: mag1.nr,
      identifier: mag1.identifier,
      title: mag1.title,
      pageRange: mag1.pageRange,
    })
  })

  test('fills missing magazines from fallback when repo returns 0', async () => {
    vi.mocked(mockRepo.getMagazines).mockResolvedValue([])
    const app = buildApp()
    const res = await app.inject({ method: 'GET', url: '/daily/2024-01-01' })
    expect(res.statusCode).toBe(200)
    expect(res.json()).toHaveLength(3)
  })

  test('fills only the missing nr slots from fallback', async () => {
    // repo returns nr 1 and 3, fallback nr 2 should fill the gap
    vi.mocked(mockRepo.getMagazines).mockResolvedValue([mag1, mag3])
    const app = buildApp()
    const res = await app.inject({ method: 'GET', url: '/daily/2024-01-01' })
    const body = res.json<{ nr: number }[]>()
    expect(body).toHaveLength(3)
    const nrs = body.map((m) => m.nr).sort()
    expect(nrs).toEqual([1, 2, 3])
  })

  test('does not duplicate a slot already present in repo', async () => {
    // repo has all 3, none of the fallback items should appear
    vi.mocked(mockRepo.getMagazines).mockResolvedValue([mag1, mag2, mag3])
    const app = buildApp()
    const res = await app.inject({ method: 'GET', url: '/daily/2024-01-01' })
    // No duplicated nrs
    const nrs = res.json<{ nr: number }[]>().map((m) => m.nr)
    expect(nrs).toHaveLength(new Set(nrs).size)
  })

  test('calls getMagazines with the date param', async () => {
    vi.mocked(mockRepo.getMagazines).mockResolvedValue([mag1, mag2, mag3])
    const app = buildApp()
    await app.inject({ method: 'GET', url: '/daily/2024-06-15' })
    expect(mockRepo.getMagazines).toHaveBeenCalledWith('2024-06-15')
  })
})

// POST /:date/:nr/guess

describe('POST /daily/:date/:nr/guess', () => {
  test('returns correct_year, difference, and score on exact guess', async () => {
    vi.mocked(mockRepo.getMagazine).mockResolvedValue(mag1) // year: 1990
    const app = buildApp()
    const res = await app.inject({
      method: 'POST',
      url: '/daily/2024-01-01/1/guess',
      payload: { year: 1990 },
    })
    expect(res.statusCode).toBe(200)
    expect(res.json()).toEqual({ correct_year: 1990, difference: 0, score: 100 })
  })

  test('score decreases by 1 per year off', async () => {
    vi.mocked(mockRepo.getMagazine).mockResolvedValue(mag1) // year: 1990
    const app = buildApp()
    const res = await app.inject({
      method: 'POST',
      url: '/daily/2024-01-01/1/guess',
      payload: { year: 1980 },
    })
    expect(res.json()).toMatchObject({ difference: 10, score: 90 })
  })

  test('score exactly 0', async () => {
    vi.mocked(mockRepo.getMagazine).mockResolvedValue(mag1) // year: 1990
    const app = buildApp()
    const res = await app.inject({
      method: 'POST',
      url: '/daily/2024-01-01/1/guess',
      payload: { year: 1890 }, // 100 years off
    })
    expect(res.json()).toMatchObject({ difference: 100, score: 0 })
  })

  test('score floors at 0 even when difference exceeds 100', async () => {
    vi.mocked(mockRepo.getMagazine).mockResolvedValue(mag1) // year: 1990
    const app = buildApp()
    const res = await app.inject({
      method: 'POST',
      url: '/daily/2024-01-01/1/guess',
      payload: { year: 1800 }, // 190 years off
    })
    expect(res.json()).toMatchObject({ score: 0 })
  })

  test('difference is absolute, guessing high and low equally penalised', async () => {
    vi.mocked(mockRepo.getMagazine).mockResolvedValue(mag1) // year: 1990
    const app = buildApp()

    const tooLow = await app.inject({
      method: 'POST',
      url: '/daily/2024-01-01/1/guess',
      payload: { year: 1985 },
    })
    const tooHigh = await app.inject({
      method: 'POST',
      url: '/daily/2024-01-01/1/guess',
      payload: { year: 1995 },
    })

    expect(tooLow.json().difference).toBe(5)
    expect(tooHigh.json().difference).toBe(5)
    expect(tooLow.json().score).toBe(tooHigh.json().score)
  })

  test('returns 400 when year is missing from body', async () => {
    vi.mocked(mockRepo.getMagazine).mockResolvedValue(mag1)
    const app = buildApp()
    const res = await app.inject({
      method: 'POST',
      url: '/daily/2024-01-01/1/guess',
      payload: {},
    })
    expect(res.json()).toMatchObject({ status: 400 })
  })

  test('falls back to fallback data when repo returns null', async () => {
    vi.mocked(mockRepo.getMagazine).mockResolvedValue(null as unknown as Magazine)
    const app = buildApp()
    // fallback nr 1 is Wizard Magazine, year 1992
    const res = await app.inject({
      method: 'POST',
      url: '/daily/2024-01-01/1/guess',
      payload: { year: 1992 },
    })
    expect(res.json()).toMatchObject({ correct_year: 1992, score: 100 })
  })

  test('calls getMagazine with date and nr params', async () => {
    vi.mocked(mockRepo.getMagazine).mockResolvedValue(mag2)
    const app = buildApp()
    await app.inject({
      method: 'POST',
      url: '/daily/2024-01-01/2/guess',
      payload: { year: 2000 },
    })
    expect(mockRepo.getMagazine).toHaveBeenCalledWith('2024-01-01', '2')
  })
})
