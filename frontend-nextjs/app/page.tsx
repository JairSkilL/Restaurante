import Link from 'next/link';
import ProductCard from '@/components/ProductCard';
import { request } from '@/services/api';
import { CATEGORIES, type Page, type Product } from '@/services/types';

type Search = Promise<Record<string, string | string[] | undefined>>;

export default async function MenuPage({ searchParams }: { searchParams: Search }) {
  const params = await searchParams;
  const read = (key: string) => (typeof params[key] === 'string' ? (params[key] as string) : '');

  const search = read('search').slice(0, 60);
  const category = Object.hasOwn(CATEGORIES, read('category')) ? read('category') : '';
  const maxPrice = Number(read('maxPrice')) > 0 ? String(Number(read('maxPrice'))) : '';
  const page = Math.max(1, Math.trunc(Number(read('page'))) || 1);

  const filters = Object.fromEntries(
    Object.entries({ search, category, maxPrice }).filter(([, value]) => value),
  );
  const query = new URLSearchParams({ ...filters, page: String(page) });
  // La respuesta se reutiliza hasta 30 segundos
  const menu = await request<Page<Product>>(`/products?${query}`, { next: { revalidate: 30 } });
  const pageLink = (target: number) =>
    `/?${new URLSearchParams({ ...filters, page: String(target) })}`;

  return (
    <>
      <h1>Nuestro menú</h1>
      <form className="panel row" action="/" key={query.toString()}>
        <input name="search" placeholder="Buscar plato" defaultValue={search} maxLength={60} />
        <select name="category" defaultValue={category} aria-label="Categoría">
          <option value="">Todas las categorías</option>
          {Object.entries(CATEGORIES).map(([value, label]) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </select>
        <input name="maxPrice" type="number" min="1" step="0.1" placeholder="Precio máximo" defaultValue={maxPrice} />
        <button>Filtrar</button>
        <Link href="/">Limpiar</Link>
      </form>

      {menu.data.length ? (
        <div className="grid">
          {menu.data.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      ) : (
        <p>No encontramos platos con esos filtros.</p>
      )}

      <div className="row">
        {page > 1 && <Link href={pageLink(page - 1)}>Anterior</Link>}
        {page < menu.pages && <Link href={pageLink(page + 1)}>Siguiente</Link>}
      </div>
    </>
  );
}
