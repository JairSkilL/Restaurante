export const ORDER_STATUSES = [
  'pendiente',
  'confirmado',
  'en_preparacion',
  'listo',
  'entregado',
  'cancelado',
] as const;

export type OrderStatus = (typeof ORDER_STATUSES)[number];

const TRANSITIONS: Record<OrderStatus, readonly OrderStatus[]> = {
  pendiente: ['confirmado', 'cancelado'],
  confirmado: ['en_preparacion', 'cancelado'],
  en_preparacion: ['listo'],
  listo: ['entregado'],
  entregado: [],
  cancelado: [],
};

export function canTransition(from: OrderStatus, to: OrderStatus): boolean {
  return TRANSITIONS[from].includes(to);
}

// Los montos se calculan en céntimos para evitar errores de decimales
export function calculateTotal(items: { price: number; quantity: number }[]): number {
  const cents = items.reduce((sum, i) => sum + Math.round(i.price * 100) * i.quantity, 0);
  return cents / 100;
}
