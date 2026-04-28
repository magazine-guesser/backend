import Fastify from 'fastify'
import healthRoute from '../routes/health'

describe('GET /health', () => {
  it('returns status ok', async () => {
    const app = Fastify()
    app.register(healthRoute)

    const response = await app.inject({
      method: 'GET',
      url: '/',
    })

    expect(response.statusCode).toBe(200)
    expect(response.json()).toEqual({ status: 'ok' })
  })
})

describe('GET ')
