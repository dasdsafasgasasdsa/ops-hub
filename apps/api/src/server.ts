import Fastify from 'fastify';
import pino from 'pino';
import { z } from 'zod';

const envSchema = z.object({
  OPS_HUB_API_PORT: z.coerce.number().int().min(1).max(65535).default(3001)
});

const env = envSchema.parse(process.env);

const logger = pino({
  name: 'ops-hub-api',
  level: process.env.LOG_LEVEL ?? 'info'
});

const app = Fastify({ loggerInstance: logger });

app.get('/health', async () => ({ status: 'ok' }));

const start = async (): Promise<void> => {
  try {
    await app.listen({
      host: '127.0.0.1',
      port: env.OPS_HUB_API_PORT
    });
  } catch (error) {
    app.log.error(error, 'api failed to start');
    process.exit(1);
  }
};

void start();
