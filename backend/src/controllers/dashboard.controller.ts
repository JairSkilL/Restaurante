import type { Request, Response } from 'express';
import { Order } from '../models/Order';
import { Product } from '../models/Product';
import { User } from '../models/User';

export async function getSummary(_req: Request, res: Response) {
  const [users, products, orders, byStatus, sales, recent] = await Promise.all([
    User.countDocuments(),
    Product.countDocuments(),
    Order.countDocuments(),
    Order.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
    Order.aggregate([
      { $match: { status: 'entregado' } },
      { $group: { _id: null, total: { $sum: '$total' } } },
    ]),
    Order.find().populate('customer', 'name').sort({ createdAt: -1 }).limit(5),
  ]);

  res.json({
    users,
    products,
    orders,
    sales: Math.round((sales[0]?.total ?? 0) * 100) / 100,
    byStatus: Object.fromEntries(byStatus.map((s) => [s._id, s.count])),
    recent,
  });
}
