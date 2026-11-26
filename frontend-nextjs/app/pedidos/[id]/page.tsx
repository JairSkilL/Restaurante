import type { Metadata } from 'next';
import OrderDetail from '@/components/OrderDetail';
import RequireAuth from '@/components/RequireAuth';

export const metadata: Metadata = { title: 'Detalle del pedido' };

export default async function OrderPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <RequireAuth>
      <OrderDetail id={id} />
    </RequireAuth>
  );
}
