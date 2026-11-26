import Link from 'next/link';
import { CATEGORIES, money, type Product } from '@/services/types';
import AddToCart from './AddToCart';
import DishImage from './DishImage';

export default function ProductCard({ product }: { product: Product }) {
  return (
    <article className="card">
      <DishImage src={product.imageUrl} alt={product.name} />
      <small>{CATEGORIES[product.category]}</small>
      <h2>
        <Link href={`/platos/${product._id}`}>{product.name}</Link>
      </h2>
      <p>{product.description}</p>
      <strong>{money(product.price)}</strong>
      <AddToCart product={product} />
    </article>
  );
}
