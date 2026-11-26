import type { ErrorRequestHandler, RequestHandler } from 'express';
import { ZodError } from 'zod';
import { HttpError } from '../utils/HttpError';

export const notFound: RequestHandler = (_req, res) => {
  res.status(404).json({ message: 'Ruta no encontrada' });
};

export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  if (err instanceof ZodError) {
    res.status(400).json({
      message: 'Datos no válidos',
      errors: err.issues.map((i) => ({ field: i.path.join('.'), message: i.message })),
    });
    return;
  }
  if (err instanceof HttpError) {
    res.status(err.status).json({ message: err.message });
    return;
  }
  if (err?.code === 11000) {
    res.status(409).json({ message: 'El registro ya existe' });
    return;
  }
  if (err?.type === 'entity.parse.failed') {
    res.status(400).json({ message: 'JSON mal formado' });
    return;
  }
  if (err?.type === 'entity.too.large') {
    res.status(413).json({ message: 'La solicitud es demasiado grande' });
    return;
  }
  console.error(err);
  res.status(500).json({ message: 'Error interno del servidor' });
};
