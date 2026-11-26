export const CATEGORIES = {
  entrada: 'Entradas',
  plato_principal: 'Platos principales',
  postre: 'Postres',
  bebida: 'Bebidas',
} as const;

export type Category = keyof typeof CATEGORIES;

export const STATUS_LABELS = {
  pendiente: 'Pendiente',
  confirmado: 'Confirmado',
  en_preparacion: 'En preparación',
  listo: 'Listo',
  entregado: 'Entregado',
  cancelado: 'Cancelado',
} as const;

export type OrderStatus = keyof typeof STATUS_LABELS;

export interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  category: Category;
  imageUrl: string;
  available: boolean;
}

export interface Order {
  _id: string;
  items: { product: string; name: string; price: number; quantity: number }[];
  total: number;
  status: OrderStatus;
  type: 'delivery' | 'recojo';
  address: string;
  notes: string;
  createdAt: string;
}

export interface Page<T> {
  data: T[];
  total: number;
  page: number;
  pages: number;
}

export interface SessionUser {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'cliente';
}

export interface Session {
  token: string;
  user: SessionUser;
}

export const money = (value: number) => `S/ ${value.toFixed(2)}`;

export const formatDate = (value: string) =>
  new Date(value).toLocaleString('es-PE', {
    dateStyle: 'short',
    timeStyle: 'short',
    timeZone: 'America/Lima',
  });
