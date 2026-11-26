'use client';

import { useCart } from '@/context/CartContext';
import type { Product } from '@/services/types';

export default function AddToCart({ product }: { product: Product }) {
  const { items, dispatch } = useCart();
  const quantity = items.find((i) => i.id === product._id)?.quantity ?? 0;

  return (
    <button type="button" onClick={() => dispatch({ type: 'add', product })}>
      {quantity ? `Agregar otro (${quantity})` : 'Agregar al carrito'}
    </button>
  );
}
