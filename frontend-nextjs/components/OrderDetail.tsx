'use client';

import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { getMessage } from '@/services/api';
import { STATUS_LABELS, formatDate, money, type Order } from '@/services/types';

export default function OrderDetail({ id }: { id: string }) {
  const { authRequest } = useAuth();
  const [order, setOrder] = useState<Order>();
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    try {
      setOrder(await authRequest<Order>(`/orders/${encodeURIComponent(id)}`));
    } catch (e) {
      setError(getMessage(e));
    }
  }, [id, authRequest]);

  useEffect(() => {
    load();
  }, [load]);

  async function cancel() {
    if (!confirm('¿Cancelar este pedido?')) return;
    setError('');
    try {
      await authRequest(`/orders/${encodeURIComponent(id)}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status: 'cancelado' }),
      });
    } catch (e) {
      setError(getMessage(e));
    }
    await load();
  }

  if (!order) return error ? <p className="error">{error}</p> : <p>Cargando…</p>;

  return (
    <div className="panel">
      <h1>Detalle del pedido</h1>
      <p>{formatDate(order.createdAt)}</p>
      <p>Estado: <strong>{STATUS_LABELS[order.status]}</strong></p>
      <p>Entrega: {order.type === 'delivery' ? `Delivery a ${order.address}` : 'Recojo en el local'}</p>
      {order.notes && <p>Notas: {order.notes}</p>}
      <ul>
        {order.items.map((item) => (
          <li key={item.product}>
            {item.quantity} × {item.name} ({money(item.price)})
          </li>
        ))}
      </ul>
      <p><strong>Total: {money(order.total)}</strong></p>
      {error && <p className="error">{error}</p>}
      <div className="row">
        <button type="button" onClick={() => { setError(''); load(); }}>Actualizar estado</button>
        {order.status === 'pendiente' && (
          <button type="button" className="alt" onClick={cancel}>Cancelar pedido</button>
        )}
        <Link href="/pedidos">Volver al historial</Link>
      </div>
    </div>
  );
}
