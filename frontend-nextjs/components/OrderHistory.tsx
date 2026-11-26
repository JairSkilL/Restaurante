'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { getMessage } from '@/services/api';
import { STATUS_LABELS, formatDate, money, type Order, type Page } from '@/services/types';

export default function OrderHistory() {
  const { authRequest } = useAuth();
  const [page, setPage] = useState(1);
  const [result, setResult] = useState<Page<Order>>();
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    setError('');
    authRequest<Page<Order>>(`/orders?page=${page}`)
      .then((data) => active && setResult(data))
      .catch((e) => active && setError(getMessage(e)));
    return () => {
      active = false;
    };
  }, [page, authRequest]);

  if (error) return <p className="error">{error}</p>;
  if (!result) return <p>Cargando…</p>;
  if (!result.total) return <p>Aún no tienes pedidos.</p>;

  return (
    <>
      {result.data.map((order) => (
        <div className="panel row" key={order._id}>
          <span>{formatDate(order.createdAt)}</span>
          <span>{STATUS_LABELS[order.status]}</span>
          <strong>{money(order.total)}</strong>
          <Link href={`/pedidos/${order._id}`}>Ver detalle</Link>
        </div>
      ))}
      <div className="row">
        <button type="button" disabled={page <= 1} onClick={() => setPage(page - 1)}>Anterior</button>
        <span>Página {page} de {result.pages}</span>
        <button type="button" disabled={page >= result.pages} onClick={() => setPage(page + 1)}>Siguiente</button>
      </div>
    </>
  );
}
