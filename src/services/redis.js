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

/**
 * @name getKey
 * @param {Object} req Express request object
 * @param {Boolean} withUserId Value indicating whether to include userId while generating the key. The Id is gotten from req object which must has been set with jwt middleware
 * @return {string} Generated key
 */
export const getKey = (req, withUserId = false) => {
  const { method, url } = req;
  let key = `method:${method}, url:${url}`;
  if (req.userId && withUserId) key = `user:${req.userId}, ${key}`;
  return key;
};

/**
 * @name readFromCache
 * @param {Object} req Express request object
 * @param {Function} callback Callback function to receive the retrieved data
 * @param {Boolean} withUserId
 * @return {Boolean} Returns if data exits in cache or not
 */
export const readFromCache = (req, callback, withUserId = false) => {
  const key = getKey(req, withUserId);
  redisClient.get(key, (err, data) => {
    let cachedObj;
    if (data) {
      try {
        cachedObj = JSON.parse(data);
      } catch (e) {
        cachedObj = data;
      }
    }
    callback(cachedObj);
  });
};

/**
 * @name setCache
 * @param {Object} req Express request object
 * @param {Object} data Data to be cached
 * @param {Number} expiresIn expiration time for cache in seconds
 * @param {Boolean} withUserId Boolean value specifying if the cache belongs to a specific user
 * @param {Function} callback optional function for successful cache
 * @return {Null} Null
 */
export const setCache = (
  req,
  data,
  expiresIn = null,
  withUserId = false,
  callback = () => {},
) => {
  const exp = expiresIn || process.env.REDIS_DATA_EXPIRATION;
  const key = getKey(req, withUserId);
  let stringifyData;
  try {
    stringifyData = JSON.stringify(data);
  } catch (e) {
    stringifyData = `${data || ''}`;
  }
  redisClient.setex(key, exp, JSON.stringify(stringifyData), callback);
};

export default redisClient;
