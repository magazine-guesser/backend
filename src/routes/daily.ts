import { FastifyInstance } from 'fastify'

export default async function (app: FastifyInstance) {

    app.get('/', async () => {
        return { hello: 'daily' }
    })

    app.get<{
        Params: { nr: string },
        Querystring: { year?: string }
    }>('/:nr', async (request) => {
        const { nr } = request.params
        return { hello: nr }
    })
}
