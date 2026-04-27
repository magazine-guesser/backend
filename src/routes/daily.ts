import { FastifyInstance } from 'fastify'
import { IMagazineRepository, Magazine } from '../types';
import fallbackData from '../fallback.json';

const fallback = fallbackData as unknown as Magazine[];

export default async function (app: FastifyInstance, opts: { repo: IMagazineRepository }) {

    const repo = opts.repo;

    app.get<{
        Params: { date: string }
    }>('/:date', async (request) => {

        const { date } = request.params;
        const magazines = await repo.getMagazines(date);

        if(magazines.length < 3){
            const existingNrs = new Set(magazines.map(mag => mag.nr));
            const missing = fallback.filter(f => !existingNrs.has(f.nr));
            magazines.push(...missing);
        };

        return magazines;
    });
}
