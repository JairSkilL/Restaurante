import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import AddToCart from '@/components/AddToCart';
import DishImage from '@/components/DishImage';
import { ApiError, request } from '@/services/api';
import { CATEGORIES, money, type Product } from '@/services/types';

type Props = { params: Promise<{ id: string }> };

async function getProduct(id: string) {
  if (!/^[a-f\d]{24}$/i.test(id)) notFound();
  try {
    return await request<Product>(`/products/${id}`, { next: { revalidate: 30 } });
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) notFound();
    throw error;
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const product = await getProduct((await params).id);
  return { title: product.name, description: product.description };
}

export default async function ProductPage({ params }: Props) {
  const product = await getProduct((await params).id);
  return (
    <article className="card detail">
      <DishImage src={product.imageUrl} alt={product.name} />
      <small>{CATEGORIES[product.category]}</small>
      <h1>{product.name}</h1>
      <p>{product.description}</p>
      <strong>{money(product.price)}</strong>
      <AddToCart product={product} />
      <Link href="/">Volver al menú</Link>
    </article>
  );
}
