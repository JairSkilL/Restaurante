import type { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt, { type SignOptions } from 'jsonwebtoken';
import { env } from '../config/env';
import { User } from '../models/User';
import { HttpError } from '../utils/HttpError';
import { loginSchema, registerSchema } from '../utils/schemas';

interface SessionInput {
  _id?: unknown;
  id?: string;
  name: string;
  email: string;
  role: string;
  tokenVersion: number;
}

function session(user: SessionInput) {
  const id = user.id ?? (user._id ? String(user._id) : '');
  const token = jwt.sign({ ver: user.tokenVersion }, env.jwtSecret, {
    subject: id,
    expiresIn: env.jwtExpiresIn as SignOptions['expiresIn'],
    algorithm: 'HS256',
  });
  const { name, email, role } = user;
  return { token, user: { id, name, email, role } };
}

export async function register(req: Request, res: Response) {
  // El esquema no admite "role": todo registro público es de tipo cliente
  const { name, email, password } = registerSchema.parse(req.body);
  if (await User.exists({ email })) throw new HttpError(409, 'El correo ya está registrado');

  const passwordHash = await bcrypt.hash(password, 12);
  const user = await User.create({ name, email, passwordHash });
  res.status(201).json(session(user));
}

export async function login(req: Request, res: Response) {
  const { email, password } = loginSchema.parse(req.body);
  const user = await User.findOne({ email }).select('+passwordHash');
  const valid = user ? await bcrypt.compare(password, user.passwordHash) : false;
  if (!user || !valid || !user.active) throw new HttpError(401, 'Credenciales incorrectas');
  res.json(session(user));
}

export async function me(req: Request, res: Response) {
  const user = await User.findById(req.user!.id).select('name email role');
  res.json(user);
}

export async function logout(req: Request, res: Response) {
  await User.findByIdAndUpdate(req.user!.id, { $inc: { tokenVersion: 1 } });
  res.status(204).end();
}