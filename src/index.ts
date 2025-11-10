import Server from './server/server';
import env from 'dotenv';
env.config();
const server = new Server();
