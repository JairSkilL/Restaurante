import { HttpErrorResponse } from '@angular/common/http';

export function errorMessage(error: HttpErrorResponse): string {
  if (error.status === 0) return 'No se pudo conectar con el servidor';
  const details: { field: string; message: string }[] = error.error?.errors ?? [];
  if (details.length) return details.map((d) => `${d.field}: ${d.message}`).join('. ');
  return error.error?.message ?? 'Ocurrió un error';
}
