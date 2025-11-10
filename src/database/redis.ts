import { createClient } from 'redis';

// Opcional: usar variables de entorno
const REDIS_HOST = process.env.REDIS_HOST || '127.0.0.1';
const REDIS_PORT = Number(process.env.REDIS_PORT) || 6379;

const client = createClient({
  socket: {
    host: REDIS_HOST,
    port: REDIS_PORT,
  }
});

client.on('error', (err) => console.error('Redis Client Error', err));

async function connectRedis() {
  await client.connect();
  console.log('✅ Redis conectado');
}

export { client, connectRedis };
