import { Component, OnInit, inject } from '@angular/core';
import { DatePipe, DecimalPipe, NgFor, NgIf } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { ApiService } from '../services/api.service';
import { errorMessage } from '../services/error-message';
import { Order, OrderStatus } from '../app/models';

@Component({
  standalone: true,
  imports: [NgIf, NgFor, DatePipe, DecimalPipe, ReactiveFormsModule],
  template: `
    <h1>Pedidos</h1>
    <p class="error" *ngIf="error">{{ error }}</p>

    <div class="panel actions">
      <select [formControl]="status" (change)="load(1)">
        <option value="">Todos los estados</option>
        <option *ngFor="let s of statuses" [value]="s">{{ s }}</option>
      </select>
      <button type="button" (click)="load(page)">Actualizar</button>
    </div>

    <div class="panel" *ngIf="selected">
      <h2>Detalle del pedido {{ selected._id }}</h2>
      <p>Cliente: {{ selected.customer?.name }} ({{ selected.customer?.email }})</p>
      <p>Entrega: {{ selected.type }} {{ selected.address }}</p>
      <p *ngIf="selected.notes">Notas: {{ selected.notes }}</p>
      <ul>
        <li *ngFor="let item of selected.items">
          {{ item.quantity }} × {{ item.name }} (S/ {{ item.price | number: '1.2-2' }})
        </li>
      </ul>
      <p><strong>Total: S/ {{ selected.total | number: '1.2-2' }}</strong></p>
      <p>Estado: {{ selected.status }}</p>
      <div class="actions">
        <button type="button" *ngFor="let s of next[selected.status]" (click)="change(s)">
          Pasar a {{ s }}
        </button>
        <button type="button" class="alt" (click)="selected = undefined">Cerrar</button>
      </div>
    </div>

    <div class="panel table">
      <table>
        <tr><th>Fecha</th><th>Cliente</th><th>Estado</th><th>Total</th><th></th></tr>
        <tr *ngFor="let order of orders">
          <td>{{ order.createdAt | date: 'dd/MM/yyyy HH:mm' }}</td>
          <td>{{ order.customer?.name ?? 'Sin datos' }}</td>
          <td>{{ order.status }}</td>
          <td>S/ {{ order.total | number: '1.2-2' }}</td>
          <td><button type="button" (click)="show(order._id)">Ver detalle</button></td>
        </tr>
      </table>
      <p *ngIf="!orders.length">No hay pedidos para mostrar.</p>
      <div class="actions">
        <button type="button" [disabled]="page <= 1" (click)="load(page - 1)">Anterior</button>
        <span>Página {{ page }} de {{ pages || 1 }}</span>
        <button type="button" [disabled]="page >= pages" (click)="load(page + 1)">Siguiente</button>
      </div>
    </div>
  `,
})
export class OrdersComponent implements OnInit {
  private api = inject(ApiService);
  statuses: OrderStatus[] = [
    'pendiente', 'confirmado', 'en_preparacion', 'listo', 'entregado', 'cancelado',
  ];
  // Debe coincidir con las transiciones del backend
  next: Record<OrderStatus, OrderStatus[]> = {
    pendiente: ['confirmado', 'cancelado'],
    confirmado: ['en_preparacion', 'cancelado'],
    en_preparacion: ['listo'],
    listo: ['entregado'],
    entregado: [],
    cancelado: [],
  };
  status = new FormControl('', { nonNullable: true });
  orders: Order[] = [];
  selected?: Order;
  page = 1;
  pages = 1;
  error = '';

  ngOnInit() { this.load(1); }

  load(page: number) {
    this.error = '';
    this.api.orders({ status: this.status.value, page, limit: 10 }).subscribe({
      next: (result) => {
        if (!result.data.length && page > 1) return this.load(page - 1);
        this.orders = result.data;
        this.page = result.page;
        this.pages = result.pages;
      },
      error: (e) => (this.error = errorMessage(e)),
    });
  }

  show(id: string) {
    this.error = '';
    this.api.order(id).subscribe({
      next: (order) => (this.selected = order),
      error: (e) => (this.error = errorMessage(e)),
    });
  }

  change(status: OrderStatus) {
    if (!this.selected) return;
    if (status === 'cancelado' && !confirm('¿Cancelar este pedido?')) return;
    const id = this.selected._id;
    this.api.setStatus(id, status).subscribe({
      next: () => {
        this.load(this.page);
        this.show(id);
      },
      error: (e) => (this.error = errorMessage(e)),
    });
  }
}
