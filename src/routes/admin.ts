import { FastifyInstance } from 'fastify'
import { IMagazineRepository, Magazine } from '../types';

export default async function (app: FastifyInstance, opts: { repo: IMagazineRepository }) {

    const secret = process.env.ADMIN_KEY;

    app.get<{
        Querystring: { secret: string }
    }>('/', async (request) => {
        const querySecret = request.query.secret;
        if (!secret) return { no: 'secret' };
        if (querySecret === secret) return { yes: 'works' };
    })

}