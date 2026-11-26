import type { Request, Response } from 'express';
import { Product } from '../models/Product';
import { HttpError } from '../utils/HttpError';
import { objectId, productQuerySchema, productSchema } from '../utils/schemas';

const escapeRegex = (text: string) => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

async function list(req: Request, res: Response, onlyAvailable: boolean) {
  const { search, category, minPrice, maxPrice, page, limit } = productQuerySchema.parse(req.query);

  const filter: Record<string, unknown> = {};
  if (onlyAvailable) filter.available = true;
  if (search) filter.name = { $regex: escapeRegex(search), $options: 'i' };
  if (category) filter.category = category;
  if (minPrice !== undefined || maxPrice !== undefined) {
    filter.price = {
      ...(minPrice !== undefined && { $gte: minPrice }),
      ...(maxPrice !== undefined && { $lte: maxPrice }),
    };
  }

  const [data, total] = await Promise.all([
    Product.find(filter).sort({ name: 1, _id: 1 }).skip((page - 1) * limit).limit(limit),
    Product.countDocuments(filter),
  ]);
  res.json({ data, total, page, pages: Math.ceil(total / limit) });
}

// Menú público para clientes
export const listMenu = (req: Request, res: Response) => list(req, res, true);
// Listado completo para el panel
export const listAll = (req: Request, res: Response) => list(req, res, false);

export async function getProduct(req: Request, res: Response) {
  const product = await Product.findOne({ _id: objectId.parse(req.params.id), available: true });
  if (!product) throw new HttpError(404, 'Plato no encontrado');
  res.json(product);
}

export async function createProduct(req: Request, res: Response) {
  res.status(201).json(await Product.create(productSchema.parse(req.body)));
}

export async function updateProduct(req: Request, res: Response) {
  const product = await Product.findByIdAndUpdate(
    objectId.parse(req.params.id),
    productSchema.partial().parse(req.body),
    { new: true, runValidators: true },
  );
  if (!product) throw new HttpError(404, 'Plato no encontrado');
  res.json(product);
}

export async function deleteProduct(req: Request, res: Response) {
  const product = await Product.findByIdAndDelete(objectId.parse(req.params.id));
  if (!product) throw new HttpError(404, 'Plato no encontrado');
  res.status(204).end();
}
