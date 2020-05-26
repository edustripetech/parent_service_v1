import express from 'express';
import { ok } from '../utils';

const router = express();
router.get('/', (_req, res) =>
  ok(res, {
    status: res.statusCode,
    message: 'Edustripe Parents Service V1',
  }),
);

export default router;
