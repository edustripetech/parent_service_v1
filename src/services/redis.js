import redis from 'redis';
import { config } from 'dotenv';
import chalk from 'chalk';

const { debug } = console;
config();

const isProduction = process.env.NODE_ENV === 'production';

const redisClient = redis.createClient(process.env.REDIS_URL);

redisClient.on('ready', () => {
  if (!isProduction) debug(`[app] ${chalk.green('Redis is ready!')}`);
});

redisClient.on('error', (err) => {
  if (!isProduction) debug(`[app] ${chalk.red(err)}`);
});

export default redisClient;
