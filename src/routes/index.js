import express from 'express';
import { ok } from '../utils';
import { readFromCache, setCache } from '../services/redis';

const router = express();

router.get('/', (_req, res) => {
  readFromCache(_req, (data) => {
    if (data) {
      ok(res, data);
      return;
    }
    const d = {
      status: res.statusCode,
      message: 'Edustripe Parents Service V1',
    };
    setCache(_req, d, 1800);
    ok(res, d);
  });
});

export default router;
