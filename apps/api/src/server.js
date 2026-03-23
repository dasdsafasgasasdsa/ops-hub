import Fastify from 'fastify';
import { z } from 'zod';
import pino from 'pino';

const envSchema = z.object({
  API_HOST: z.string().default('127.0.0.1'),
  API_PORT: z
    .string()
    .regex(/^\d+$/)
    .transform((value) => Number(value))
    .pipe(z.number().int().min(1).max(65535))
    .default('3001')
});

const env = envSchema.parse(process.env);

const logger = pino({
  name: 'ops-hub-api',
  level: process.env.LOG_LEVEL ?? 'info'
});

const app = Fastify({ loggerInstance: logger });

app.get('/health', async () => ({
  status: 'ok'
}));

const start = async () => {
  try {
    await app.listen({
      host: env.API_HOST,
      port: env.API_PORT
    });
  } catch (error) {
    app.log.error(error, 'api failed to start');
    process.exit(1);
  }
};

start();
