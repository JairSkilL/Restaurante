'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, type FormEvent } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { getMessage } from '@/services/api';
import { money, type Order } from '@/services/types';

export default function Checkout() {
  const { user, authRequest } = useAuth();
  const { items, total, dispatch } = useCart();
  const router = useRouter();
  const [type, setType] = useState<Order['type']>('recojo');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    setError('');
    setLoading(true);
    try {
      const order = await authRequest<Order>('/orders', {
        method: 'POST',
        body: JSON.stringify({
          items: items.map((i) => ({ productId: i.id, quantity: i.quantity })),
          type,
          address: type === 'delivery' ? String(data.get('address')).trim() : '',
          notes: String(data.get('notes')).trim(),
        }),
      });
      dispatch({ type: 'clear' });
      router.push(`/pedidos/${order._id}`);
    } catch (e) {
      setError(getMessage(e));
      setLoading(false);
    }
  }

  if (!items.length) {
    return <p>Tu carrito está vacío. <Link href="/">Ver el menú</Link></p>;
  }

  return (
    <>
      <div className="panel">
        {items.map((item) => (
          <div className="row" key={item.id}>
            <span>{item.name} ({money(item.price)})</span>
            <input
              type="number"
              min={1}
              max={50}
              value={item.quantity}
              aria-label={`Cantidad de ${item.name}`}
              onChange={(e) =>
                dispatch({ type: 'quantity', id: item.id, quantity: Number(e.target.value) })
              }
            />
            <button type="button" className="alt" onClick={() => dispatch({ type: 'remove', id: item.id })}>
              Quitar
            </button>
          </div>
        ))}
        <p><strong>Total estimado: {money(total)}</strong></p>
        <small>El total final se calcula con los precios vigentes al registrar el pedido.</small>
      </div>

      {user ? (
        <form className="panel" onSubmit={submit}>
          <label>
            Tipo de entrega
            <select value={type} onChange={(e) => setType(e.target.value as Order['type'])}>
              <option value="recojo">Recojo en el local</option>
              <option value="delivery">Delivery</option>
            </select>
          </label>
          {type === 'delivery' && (
            <label>
              Dirección
              <input name="address" required minLength={5} maxLength={200} />
            </label>
          )}
          <label>
            Notas (opcional)
            <textarea name="notes" maxLength={300} />
          </label>
          {error && <p className="error" role="alert">{error}</p>}
          <button disabled={loading}>{loading ? 'Enviando…' : 'Registrar pedido'}</button>
        </form>
      ) : (
        <p className="panel"><Link href="/login">Inicia sesión</Link> para registrar tu pedido.</p>
      )}
    </>
  );
}
