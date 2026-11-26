'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, type FormEvent } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { getMessage } from '@/services/api';

export default function AuthForm({ mode }: { mode: 'login' | 'register' }) {
  const isRegister = mode === 'register';
  const { login, register } = useAuth();
  const { count } = useCart();
  const router = useRouter();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const email = String(data.get('email')).trim();
    const password = String(data.get('password'));
    setError('');
    setLoading(true);
    try {
      if (isRegister) await register(String(data.get('name')).trim(), email, password);
      else await login(email, password);
      router.push(count ? '/carrito' : '/');
    } catch (e) {
      setError(getMessage(e));
      setLoading(false);
    }
  }

  return (
    <form className="panel auth" onSubmit={submit}>
      <h1>{isRegister ? 'Crear cuenta' : 'Iniciar sesión'}</h1>
      {isRegister && (
        <label>
          Nombre
          <input name="name" required minLength={2} maxLength={80} autoComplete="name" />
        </label>
      )}
      <label>
        Correo
        <input name="email" type="email" required autoComplete="email" />
      </label>
      <label>
        Contraseña
        <input
          name="password"
          type="password"
          required
          minLength={isRegister ? 8 : 1}
          maxLength={72}
          autoComplete={isRegister ? 'new-password' : 'current-password'}
        />
      </label>
      {error && <p className="error" role="alert">{error}</p>}
      <button disabled={loading}>{isRegister ? 'Registrarme' : 'Ingresar'}</button>
      <p>
        {isRegister ? (
          <Link href="/login">Ya tengo una cuenta</Link>
        ) : (
          <Link href="/registro">Crear una cuenta</Link>
        )}
      </p>
    </form>
  );
}
