import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../environments/environment';
import { Order, OrderStatus, Page, Product, ProductInput, Summary, User } from '../app/models';

// Omite los filtros vacíos
function toParams(values: Record<string, string | number | null | undefined>) {
  let params = new HttpParams();
  for (const [key, value] of Object.entries(values)) {
    if (value !== null && value !== undefined && value !== '') params = params.set(key, value);
  }
  return params;
}

@Injectable({ providedIn: 'root' })
export class ApiService {
  private http = inject(HttpClient);
  private url = environment.apiUrl;

  summary() { return this.http.get<Summary>(`${this.url}/dashboard`); }

  products(filters: Record<string, string | number | null>) {
    return this.http.get<Page<Product>>(`${this.url}/products/admin`, { params: toParams(filters) });
  }
  createProduct(data: ProductInput) { return this.http.post<Product>(`${this.url}/products`, data); }
  updateProduct(id: string, data: ProductInput) {
    return this.http.put<Product>(`${this.url}/products/${id}`, data);
  }
  deleteProduct(id: string) { return this.http.delete<void>(`${this.url}/products/${id}`); }

  orders(filters: Record<string, string | number | null>) {
    return this.http.get<Page<Order>>(`${this.url}/orders`, { params: toParams(filters) });
  }
  order(id: string) { return this.http.get<Order>(`${this.url}/orders/${id}`); }
  setStatus(id: string, status: OrderStatus) {
    return this.http.patch<Order>(`${this.url}/orders/${id}/status`, { status });
  }

  users() { return this.http.get<User[]>(`${this.url}/users`); }
  updateUser(id: string, data: Pick<User, 'name' | 'role' | 'active'>) {
    return this.http.patch(`${this.url}/users/${id}`, data);
  }
  deactivateUser(id: string) { return this.http.delete<void>(`${this.url}/users/${id}`); }
}
