'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';

export default function Header() {
  const { user, ready, logout } = useAuth();
  const { count, dispatch } = useCart();
  const router = useRouter();

  async function handleLogout() {
    await logout();
    dispatch({ type: 'clear' });
    router.push('/');
  }

  return (
    <header>
      <Link href="/" className="brand">Restaurante</Link>
      <nav>
        <Link href="/">Menú</Link>
        <Link href="/carrito">Carrito ({count})</Link>
        {ready && user && (
          <>
            <Link href="/pedidos">Mis pedidos</Link>
            <span>Hola, {user.name}</span>
            <button type="button" onClick={handleLogout}>Cerrar sesión</button>
          </>
        )}
        {ready && !user && (
          <>
            <Link href="/login">Ingresar</Link>
            <Link href="/registro">Registrarse</Link>
          </>
        )}
      </nav>
    </header>
  );
}
