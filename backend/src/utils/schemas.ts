import { z } from 'zod';
import { CATEGORIES } from '../models/Product';
import { ROLES } from '../models/User';
import { ORDER_STATUSES } from './orderStatus';

export const objectId = z.string().regex(/^[a-f\d]{24}$/i, 'Identificador no válido');

const email = z.string().trim().toLowerCase().email('Correo no válido');

// bcrypt solo procesa los primeros 72 bytes de la contraseña
const password = z
  .string()
  .min(8, 'Mínimo 8 caracteres')
  .refine((v) => Buffer.byteLength(v) <= 72, 'Contraseña demasiado larga');

export const registerSchema = z.object({
  name: z.string().trim().min(2).max(80),
  email,
  password,
});

export const loginSchema = z.object({ email, password: z.string().min(1).max(200) });

export const productSchema = z.object({
  name: z.string().trim().min(2).max(100),
  description: z.string().trim().max(500).optional(),
  price: z.number().min(0.1).max(10000),
  category: z.enum(CATEGORIES),
  imageUrl: z.union([z.string().url().startsWith('https://'), z.literal('')]).optional(),
  available: z.boolean().optional(),
});

export const productQuerySchema = z.object({
  search: z.string().trim().max(60).optional(),
  category: z.enum(CATEGORIES).optional(),
  minPrice: z.coerce.number().min(0).optional(),
  maxPrice: z.coerce.number().min(0).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(12),
});

export const orderSchema = z
  .object({
    items: z
      .array(z.object({ productId: objectId, quantity: z.number().int().min(1).max(50) }))
      .min(1, 'El pedido está vacío')
      .max(30),
    type: z.enum(['delivery', 'recojo']),
    address: z.string().trim().max(200).default(''),
    notes: z.string().trim().max(300).default(''),
  })
  .refine((o) => o.type !== 'delivery' || o.address.length >= 5, {
    message: 'La dirección es obligatoria para delivery',
    path: ['address'],
  });

export const orderQuerySchema = z.object({
  status: z.enum(ORDER_STATUSES).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(10),
});

export const statusSchema = z.object({ status: z.enum(ORDER_STATUSES) });

export const userUpdateSchema = z
  .object({
    name: z.string().trim().min(2).max(80),
    role: z.enum(ROLES),
    active: z.boolean(),
  })
  .partial();
