const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/api';

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

export type RequestOptions = RequestInit & {
  token?: string;
  next?: { revalidate: number };
};

export async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { token, headers, ...init } = options;
  const allHeaders = new Headers(headers);
  if (init.body) allHeaders.set('Content-Type', 'application/json');
  if (token) allHeaders.set('Authorization', `Bearer ${token}`);

  let response: Response;
  try {
    response = await fetch(`${API_URL}${path}`, { ...init, headers: allHeaders });
  } catch {
    throw new ApiError(0, 'No se pudo conectar con el servidor');
  }

  if (response.status === 204) return undefined as T;
  const body = await response.json().catch(() => null);
  if (!response.ok) {
    const details: { field: string; message: string }[] = body?.errors ?? [];
    const message = details.length
      ? details.map((d) => `${d.field}: ${d.message}`).join('. ')
      : (body?.message ?? 'Ocurrió un error');
    throw new ApiError(response.status, message);
  }
  return body as T;
}

export const getMessage = (error: unknown) =>
  error instanceof Error ? error.message : 'Ocurrió un error';
