import { FastifyInstance } from 'fastify'

export default async function (app: FastifyInstance) {

    app.get('/', async () => {
        return { hello: 'daily' }
    })

    app.get('/:nr', async (request) => {
        const { nr } = request.params as { nr: string }
        return { hello: nr }
    })
}
