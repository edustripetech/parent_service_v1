import express from 'express';
import path from 'path';
import bodyParser from 'body-parser';
import cors from 'cors';
import swaggerUi from 'swagger-ui-express';
import errorhandler from 'errorhandler';
import morgan from 'morgan';
import debug from 'debug';
import chalk from 'chalk';
import docs from '../docs';
import 'dotenv/config';
import routes from './routes';

const isProduction = process.env.NODE_ENV === 'production';
const app = express();
const print = debug('dev');
const { PORT = 3000 } = process.env;

app.use(cors());
app.use(morgan('dev'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use('/docs', swaggerUi.serve, swaggerUi.setup(docs));

app.use(express.static(path.join(__dirname, 'public')));

if (!isProduction) {
  app.use(errorhandler());
}

app.get('/', (_req, res) => res.status(301).redirect('/api/v1'));
app.use('/api/v1', routes);

app.use('*', (_req, res) =>
  res.status(404).json({
    status: res.statusCode,
    error: 'Resource not found. Double check the url and try again',
  }),
);

app.use((err, _req, res, next) => {
  if (!isProduction) print(err.stack);
  if (res.headersSent) return next(err);
  return res.status(err.status || 500).json({
    status: res.statusCode,
    error: isProduction ? 'Internal server error' : err.message,
  });
});

app.listen(PORT, () => {
  print(`Listening on port ${chalk.blue(PORT)}`);
});

export default app;
