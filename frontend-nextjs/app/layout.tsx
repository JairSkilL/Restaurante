import type { Metadata } from 'next';
import Header from '@/components/Header';
import { AuthProvider } from '@/context/AuthContext';
import { CartProvider } from '@/context/CartContext';
import './globals.css';

export const metadata: Metadata = {
  title: { default: 'Restaurante | Pedidos en línea', template: '%s | Restaurante' },
  description: 'Consulta el menú y haz tu pedido en línea.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>
        <AuthProvider>
          <CartProvider>
            <Header />
            <main>{children}</main>
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
