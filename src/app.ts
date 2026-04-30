import Fastify from 'fastify'
import dailyRoutes from './routes/daily'
import healthRoute from './routes/health'
import adminRoute from './routes/admin'
import { DynamoMagazineRepository } from './dynamodb'

export function buildApp() {
  const app = Fastify({ logger: true })
  const repo = new DynamoMagazineRepository()

  app.register(dailyRoutes, { prefix: '/daily', repo })
  app.register(adminRoute, { prefix: '/admin', repo })
  app.register(healthRoute, { prefix: '/health' })

  return app
}
