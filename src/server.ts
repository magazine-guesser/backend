import 'dotenv/config';
import Fastify, { FastifyReply, FastifyRequest } from 'fastify';
import dailyRoutes from './routes/daily';
import healthRoute from './routes/health';
import adminRoute from './routes/admin';
import { DynamoMagazineRepository } from './dynamodb';

const app = Fastify({ logger: true });
const repo = new DynamoMagazineRepository();
//let cache: { date: string, magazines: Magazine[] } | null = null;

app.register(dailyRoutes, { prefix: '/daily', repo });
app.register(adminRoute, { prefix: '/admin', repo });
app.register(healthRoute, { prefix: '/health' });

const start = async () => {
    try {
        await app.listen({ port: 3000, host: '0.0.0.0' })
    } catch (err) {
        console.log(err);
        process.exit(1);
    }
}

process.on('SIGTERM', async () => {
    await app.close();
    process.exit(0);
});

start();