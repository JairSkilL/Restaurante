'use client';

import { createContext, useContext, useEffect, useMemo, useReducer, useState } from 'react';
import type { Product } from '@/services/types';

const KEY = 'restaurante_cart';
const MAX_ITEMS = 30;
const MAX_QUANTITY = 50;

export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

type Action =
  | { type: 'load'; items: CartItem[] }
  | { type: 'add'; product: Product }
  | { type: 'quantity'; id: string; quantity: number }
  | { type: 'remove'; id: string }
  | { type: 'clear' };

function reducer(items: CartItem[], action: Action): CartItem[] {
  switch (action.type) {
    case 'load':
      return action.items;
    case 'add': {
      const { _id, name, price } = action.product;
      const current = items.find((i) => i.id === _id);
      if (current) {
        return items.map((i) =>
          i.id === _id
            ? { ...i, name, price, quantity: Math.min(i.quantity + 1, MAX_QUANTITY) }
            : i,
        );
      }
      if (items.length >= MAX_ITEMS) return items;
      return [...items, { id: _id, name, price, quantity: 1 }];
    }
    case 'quantity':
      return items.map((i) =>
        i.id === action.id
          ? { ...i, quantity: Math.max(1, Math.min(Math.trunc(action.quantity) || 1, MAX_QUANTITY)) }
          : i,
      );
    case 'remove':
      return items.filter((i) => i.id !== action.id);
    case 'clear':
      return [];
  }
}

interface CartValue {
  items: CartItem[];
  count: number;
  // Referencial: el total definitivo lo calcula el servidor
  total: number;
  dispatch: React.Dispatch<Action>;
}

const CartContext = createContext<CartValue | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, dispatch] = useReducer(reducer, []);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(KEY) ?? '[]');
      if (Array.isArray(saved)) dispatch({ type: 'load', items: saved });
    } catch {
      localStorage.removeItem(KEY);
    }
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (loaded) localStorage.setItem(KEY, JSON.stringify(items));
  }, [items, loaded]);

  const value = useMemo(
    () => ({
      items,
      dispatch,
      count: items.reduce((sum, i) => sum + i.quantity, 0),
      total: items.reduce((sum, i) => sum + Math.round(i.price * 100) * i.quantity, 0) / 100,
    }),
    [items],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart requiere CartProvider');
  return context;
}
