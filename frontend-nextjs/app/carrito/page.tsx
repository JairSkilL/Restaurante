import type { Metadata } from 'next';
import Checkout from '@/components/Checkout';

export const metadata: Metadata = { title: 'Carrito' };

export default function CartPage() {
  return (
    <>
      <h1>Tu carrito</h1>
      <Checkout />
    </>
  );
}
