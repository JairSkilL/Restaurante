import type { Request, Response } from 'express';
import { User } from '../models/User';
import { HttpError } from '../utils/HttpError';
import { objectId, userUpdateSchema } from '../utils/schemas';

export async function listUsers(_req: Request, res: Response) {
  res.json(await User.find().select('name email role active createdAt').sort({ createdAt: -1 }));
}

async function update(req: Request, changes: Record<string, unknown>) {
  const id = objectId.parse(req.params.id).toLowerCase();
  if (id === req.user!.id && (changes.active === false || changes.role === 'cliente')) {
    throw new HttpError(400, 'No puedes quitarte tu propio acceso');
  }
  const user = await User.findByIdAndUpdate(id, changes, { new: true, runValidators: true });
  if (!user) throw new HttpError(404, 'Usuario no encontrado');
  return user;
}

export async function updateUser(req: Request, res: Response) {
  const user = await update(req, userUpdateSchema.parse(req.body));
  const { id, name, email, role, active } = user;
  res.json({ id, name, email, role, active });
}

// Baja lógica: se conserva el historial de pedidos del cliente
export async function deactivateUser(req: Request, res: Response) {
  await update(req, { active: false });
  res.status(204).end();
}
