import type { RequestHandler } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { User, type Role } from '../models/User';
import { HttpError } from '../utils/HttpError';

declare global {
  namespace Express {
    interface Request {
      user?: { id: string; role: Role };
    }
  }
}

export const requireAuth: RequestHandler = async (req, _res, next) => {
  const [scheme, token] = (req.headers.authorization ?? '').split(' ');
  if (scheme !== 'Bearer' || !token) throw new HttpError(401, 'Debes iniciar sesión');

  let payload: jwt.JwtPayload;
  try {
    payload = jwt.verify(token, env.jwtSecret, { algorithms: ['HS256'] }) as jwt.JwtPayload;
  } catch {
    throw new HttpError(401, 'Sesión no válida o expirada');
  }

  // El rol se lee de la base de datos para que los cambios apliquen de inmediato
  const user = await User.findById(payload.sub);
  if (!user || !user.active || user.tokenVersion !== payload.ver) {
    throw new HttpError(401, 'Sesión no válida o expirada');
  }

  req.user = { id: user.id, role: user.role as Role };
  next();
};

export const requireRole =
  (...roles: Role[]): RequestHandler =>
  (req, _res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      throw new HttpError(403, 'No tienes permiso para esta acción');
    }
    next();
  };
