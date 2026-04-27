import Fastify from 'fastify'
import dailyRoutes from './routes/daily'
import healthRoute from './routes/health'
import { DynamoMagazineRepository } from './dynamodb';

const app = Fastify({ logger: true });
const repo = new DynamoMagazineRepository();

app.register(dailyRoutes, { prefix: '/daily', repo })
app.register(healthRoute, { prefix: '/health' })

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

start()