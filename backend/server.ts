import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { env } from './src/config/env';
import { connectDB } from './src/config/db';
import routes from './src/routes';
import { errorHandler, notFound } from './src/middleware/error';

const app = express();

// Render y Railway usan un proxy: necesario para limitar intentos por IP
if (env.nodeEnv === 'production') app.set('trust proxy', 1);

app.use(helmet());
app.use(cors({ origin: env.corsOrigins }));
app.use(express.json({ limit: '100kb' }));

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' });
});
app.use('/api', routes);
app.use(notFound);
app.use(errorHandler);

connectDB()
  .then(() => {
    app.listen(env.port, () => console.log(`API escuchando en el puerto ${env.port}`));
  })
  .catch((error) => {
    console.error('No se pudo conectar a MongoDB:', error.message);
    process.exit(1);
  });
