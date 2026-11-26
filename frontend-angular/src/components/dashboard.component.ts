import { Component, OnInit, inject } from '@angular/core';
import { DatePipe, DecimalPipe, KeyValuePipe, NgFor, NgIf } from '@angular/common';
import { ApiService } from '../services/api.service';
import { errorMessage } from '../services/error-message';
import { Summary } from '../app/models';

@Component({
  standalone: true,
  imports: [NgIf, NgFor, DatePipe, DecimalPipe, KeyValuePipe],
  template: `
    <h1>Dashboard</h1>
    <p class="error" *ngIf="error">{{ error }}</p>
    <p *ngIf="!data && !error">Cargando…</p>
    <ng-container *ngIf="data">
      <div class="cards">
        <div class="panel">Usuarios <b>{{ data.users }}</b></div>
        <div class="panel">Platos <b>{{ data.products }}</b></div>
        <div class="panel">Pedidos <b>{{ data.orders }}</b></div>
        <div class="panel">Ventas entregadas <b>S/ {{ data.sales | number: '1.2-2' }}</b></div>
      </div>
      <div class="panel">
        <h2>Pedidos por estado</h2>
        <p *ngFor="let item of data.byStatus | keyvalue">{{ item.key }}: {{ item.value }}</p>
        <p *ngIf="!data.orders">Aún no hay pedidos.</p>
      </div>
      <div class="panel table">
        <h2>Pedidos recientes</h2>
        <table>
          <tr><th>Fecha</th><th>Cliente</th><th>Estado</th><th>Total</th></tr>
          <tr *ngFor="let order of data.recent">
            <td>{{ order.createdAt | date: 'dd/MM/yyyy HH:mm' }}</td>
            <td>{{ order.customer?.name ?? 'Sin datos' }}</td>
            <td>{{ order.status }}</td>
            <td>S/ {{ order.total | number: '1.2-2' }}</td>
          </tr>
        </table>
      </div>
    </ng-container>
  `,
})
export class DashboardComponent implements OnInit {
  private api = inject(ApiService);
  data?: Summary;
  error = '';

  ngOnInit() {
    this.api.summary().subscribe({
      next: (data) => (this.data = data),
      error: (e) => (this.error = errorMessage(e)),
    });
  }
}
