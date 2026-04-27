import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify'
import { IMagazineRepository, Magazine } from '../types'

export default async function (app: FastifyInstance, opts: { repo: IMagazineRepository }) {
  const repo = opts.repo
  app.addHook('preHandler', requireAdmin)

  app.get<{
    Params: { date: string }
  }>('/magazines/:date', async (request) => {
    const { date } = request.params
    const magazines = await repo.getMagazines(date)
    return magazines
  })

  app.put<{
    Body: { magazines: Magazine[] }
  }>('/magazines', async (request) => {
    const { magazines } = request.body
    repo.putMagazines(magazines)
    return
  })

  app.delete<{
    Body: { magazines: Magazine[] }
  }>('/magazines', async (request) => {
    const { magazines } = request.body
    repo.deleteMagazines(magazines)
    return
  })

  app.patch<{
    Params: { date: string; nr: number }
    Body: { magazine: Magazine }
  }>('/magazines/:date/:nr', async (request) => {
    const { date, nr } = request.params
    const { magazine } = request.body
    repo.editMagazine(date, nr, magazine)
  })
}

const requireAdmin = async (request: FastifyRequest, reply: FastifyReply) => {
  const key = request.headers['authorization']
  if (!key || key !== process.env.ADMIN_KEY) {
    reply.code(403).send({ message: 'Unauthorized' })
  }
}
