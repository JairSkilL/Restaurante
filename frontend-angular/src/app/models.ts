export type Role = 'admin' | 'cliente';
export type Category = 'entrada' | 'plato_principal' | 'postre' | 'bebida';
export type OrderStatus =
  | 'pendiente' | 'confirmado' | 'en_preparacion' | 'listo' | 'entregado' | 'cancelado';

export interface SessionUser { id: string; name: string; email: string; role: Role; }
export interface Session { token: string; user: SessionUser; }

export interface User { _id: string; name: string; email: string; role: Role; active: boolean; }

export interface ProductInput {
  name: string;
  description: string;
  price: number;
  category: Category;
  imageUrl: string;
  available: boolean;
}
export interface Product extends ProductInput { _id: string; }

export interface Order {
  _id: string;
  customer: { _id: string; name: string; email?: string } | null;
  items: { name: string; price: number; quantity: number }[];
  total: number;
  status: OrderStatus;
  type: 'delivery' | 'recojo';
  address: string;
  notes: string;
  createdAt: string;
}

export interface Page<T> { data: T[]; total: number; page: number; pages: number; }

export interface Summary {
  users: number;
  products: number;
  orders: number;
  sales: number;
  byStatus: Partial<Record<OrderStatus, number>>;
  recent: Order[];
}
