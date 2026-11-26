import type { Request, Response } from 'express';
import { Order } from '../models/Order';
import { Product } from '../models/Product';
import { HttpError } from '../utils/HttpError';
import { calculateTotal, canTransition, type OrderStatus } from '../utils/orderStatus';
import { objectId, orderQuerySchema, orderSchema, statusSchema } from '../utils/schemas';

export async function createOrder(req: Request, res: Response) {
  const { items, type, address, notes } = orderSchema.parse(req.body);

  const ids = items.map((i) => i.productId.toLowerCase());
  if (new Set(ids).size !== ids.length) throw new HttpError(400, 'Hay platos repetidos');

  const products = await Product.find({ _id: { $in: ids }, available: true });
  const byId = new Map(products.map((p) => [p.id as string, p]));

  // Los precios salen de la base de datos, nunca del navegador
  const detail = items.map(({ productId, quantity }) => {
    const product = byId.get(productId.toLowerCase());
    if (!product) throw new HttpError(400, 'Uno de los platos ya no está disponible');
    return { product: product._id, name: product.name, price: product.price, quantity };
  });

  const order = await Order.create({
    customer: req.user!.id,
    items: detail,
    total: calculateTotal(detail),
    type,
    address,
    notes,
  });
  res.status(201).json(order);
}

// El cliente ve solo sus pedidos; el administrador ve todos
export async function listOrders(req: Request, res: Response) {
  const { status, page, limit } = orderQuerySchema.parse(req.query);
  const filter: Record<string, unknown> = {};
  if (req.user!.role !== 'admin') filter.customer = req.user!.id;
  if (status) filter.status = status;

  const [data, total] = await Promise.all([
    Order.find(filter)
      .populate('customer', 'name email')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit),
    Order.countDocuments(filter),
  ]);
  res.json({ data, total, page, pages: Math.ceil(total / limit) });
}

function ownFilter(req: Request) {
  const id = objectId.parse(req.params.id);
  return req.user!.role === 'admin' ? { _id: id } : { _id: id, customer: req.user!.id };
}

export async function getOrder(req: Request, res: Response) {
  const order = await Order.findOne(ownFilter(req)).populate('customer', 'name email');
  if (!order) throw new HttpError(404, 'Pedido no encontrado');
  res.json(order);
}

export async function changeStatus(req: Request, res: Response) {
  const { status } = statusSchema.parse(req.body);
  const filter = ownFilter(req);
  const order = await Order.findOne(filter);
  if (!order) throw new HttpError(404, 'Pedido no encontrado');

  const current = order.status as OrderStatus;
  if (req.user!.role !== 'admin' && !(current === 'pendiente' && status === 'cancelado')) {
    throw new HttpError(403, 'Solo puedes cancelar pedidos pendientes');
  }
  if (!canTransition(current, status)) {
    throw new HttpError(409, `No se puede pasar de "${current}" a "${status}"`);
  }

  // Se filtra por el estado leído para evitar cambios simultáneos contradictorios
  const updated = await Order.findOneAndUpdate(
    { ...filter, status: current },
    { status },
    { new: true },
  );
  if (!updated) throw new HttpError(409, 'El pedido cambió; vuelve a cargarlo');
  res.json(updated);
}
