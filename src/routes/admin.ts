import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify'
import { IMagazineRepository, Magazine, PoolMagazine } from '../types'

export default async function (app: FastifyInstance, opts: { repo: IMagazineRepository }) {
  const repo = opts.repo
  app.addHook('preHandler', requireAdmin)

  app.get<{
    Params: { date: string }
  }>('/magazines/:date', async (request) => {
    const { date } = request.params
    return await repo.getMagazines(date)
  })

  app.put<{
    Body: { magazines: Magazine[] }
  }>('/magazines', async (request) => {
    const { magazines } = request.body
    await repo.putMagazines(magazines)
    return
  })

  app.delete<{
    Body: { magazines: Magazine[] }
  }>('/magazines', async (request) => {
    const { magazines } = request.body
    await repo.deleteMagazines(magazines)
    return
  })

  app.put<{
    Body: { magazines: PoolMagazine[] }
  }>('/pool', async (request) => {
    const { magazines } = request.body
    await repo.putPoolMagazines(magazines)
    return
  })

  app.patch<{
    Params: { date: string; nr: number }
    Body: { magazine: Magazine }
  }>('/magazines/:date/:nr', async (request) => {
    const { date, nr } = request.params
    const { magazine } = request.body
    return await repo.editMagazine(date, nr, magazine)
  })
}

const requireAdmin = async (request: FastifyRequest, reply: FastifyReply) => {
  const key = request.headers['authorization']
  if (!key || key !== process.env.ADMIN_KEY) {
    reply.code(403).send({ message: 'Unauthorized' })
  }
}
