# Plataforma de pedidos para restaurante

Estado: **backend**, **panel Angular 16** y **web de clientes Next.js** escritos. Pendiente: despliegue.

## Instalación de la web de clientes (Next.js)

Requiere Node.js 20.9 o superior. Con el backend en ejecución:

```bash
cd frontend-nextjs
npm install
cp .env.example .env.local
npm run dev              # http://localhost:3000
```

Producción: `npm run build` y `npm start`. Define `NEXT_PUBLIC_API_URL` antes de compilar
y agrega la URL publicada a `CORS_ORIGINS` en el backend.

- Estado global con Context API: `AuthContext` (sesión) y `CartContext` (carrito, con `useReducer`).
- El menú y el detalle de platos se generan en el servidor, con datos reutilizados hasta 30 segundos.
- `next/image` optimiza las imágenes de `images.unsplash.com` y `res.cloudinary.com`;
  las de otros dominios se muestran sin optimizar.
- La sesión se guarda en `localStorage`. Es sencillo para este proyecto, pero un script
  inyectado (XSS) podría leer el token; una cookie `HttpOnly` reduce ese riesgo.

## Instalación del panel Angular

Requiere Node.js 18 (Angular 16). Con el backend en ejecución:

```bash
cd frontend-angular
npm install
npm start                # http://localhost:4200
```

Inicia sesión con el administrador creado con `npm run seed:admin`.
La URL local de la API está en `src/environments/environment.development.ts`.
Antes de desplegar, coloca la URL pública en `src/environments/environment.ts`
y agrega la URL del panel a `CORS_ORIGINS` en el backend.
La sesión se guarda en `sessionStorage` y se pierde al cerrar la pestaña.

## Instalación del backend

Requisitos: Node.js 20 o superior y MongoDB (local o MongoDB Atlas).

```bash
cd backend
npm install
cp .env.example .env     # completa JWT_SECRET, ADMIN_EMAIL y ADMIN_PASSWORD
npm run seed:admin       # crea el primer administrador
npm run dev              # http://localhost:4000/api/health
```

Producción: `npm install --include=dev && npm run build` y luego `npm start`.
Define las variables en el panel del servicio de alojamiento, con `NODE_ENV=production`.
Nunca subas el archivo `.env` a GitHub.

## Arquitectura

`ruta → middleware (autenticación y rol) → controlador (valida con Zod) → modelo Mongoose`

## Colecciones

| Colección | Campos principales | Relación |
|---|---|---|
| users | name, email (único), passwordHash, role, active, tokenVersion | |
| products | name, description, price, category, imageUrl, available | |
| orders | customer, items[], total, status, type, address, notes | `customer` → users, `items.product` → products |

## Endpoints (prefijo `/api`)

Las rutas privadas requieren `Authorization: Bearer <token>`.

| Método | Ruta | Acceso |
|---|---|---|
| GET | /health | Público |
| POST | /auth/register, /auth/login | Público |
| GET | /auth/me | Con sesión |
| POST | /auth/logout | Con sesión |
| GET | /products, /products/:id | Público (solo disponibles) |
| GET | /products/admin | Admin |
| POST | /products | Admin |
| PUT, DELETE | /products/:id | Admin |
| POST | /orders | Cliente |
| GET | /orders, /orders/:id | Cliente (los suyos) o admin |
| PATCH | /orders/:id/status | Admin; el cliente solo cancela pendientes |
| GET | /users | Admin |
| PATCH, DELETE | /users/:id | Admin (DELETE desactiva) |
| GET | /dashboard | Admin |

Filtros de platos: `search`, `category`, `minPrice`, `maxPrice`, `page`, `limit`.
Filtros de pedidos: `status`, `page`, `limit`.
Categorías: `entrada`, `plato_principal`, `postre`, `bebida`.

### Ejemplo: crear un pedido

```json
{
  "items": [{ "productId": "ID_DEL_PLATO", "quantity": 2 }],
  "type": "delivery",
  "address": "Av. Ejemplo 123",
  "notes": "Sin cebolla"
}
```

## Estados del pedido

`pendiente → confirmado → en_preparacion → listo → entregado`

Solo se puede pasar a `cancelado` desde `pendiente` o `confirmado`.

## Decisiones de seguridad

- Contraseñas con hash bcrypt; el hash no se devuelve en las respuestas.
- El registro público siempre crea clientes.
- Cerrar sesión invalida los tokens del usuario en todos sus dispositivos.
- El total del pedido se calcula en el servidor con los precios de la base de datos.
- CORS limitado a orígenes configurados, cabeceras con Helmet y límite de intentos en registro y login.
