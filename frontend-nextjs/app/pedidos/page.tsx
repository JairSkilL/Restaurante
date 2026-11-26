import type { Metadata } from 'next';
import OrderHistory from '@/components/OrderHistory';
import RequireAuth from '@/components/RequireAuth';

export const metadata: Metadata = { title: 'Mis pedidos' };

export default function OrdersPage() {
  return (
    <>
      <h1>Mis pedidos</h1>
      <RequireAuth>
        <OrderHistory />
      </RequireAuth>
    </>
  );
}
