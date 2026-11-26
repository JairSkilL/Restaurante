import { Component, OnInit, inject } from '@angular/core';
import { DecimalPipe, NgFor, NgIf } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { finalize } from 'rxjs';
import { ApiService } from '../services/api.service';
import { errorMessage } from '../services/error-message';
import { Category, Product } from '../app/models';

@Component({
  standalone: true,
  imports: [NgIf, NgFor, DecimalPipe, ReactiveFormsModule],
  template: `
    <h1>Platos</h1>
    <p class="error" *ngIf="error">{{ error }}</p>

    <form class="panel" [formGroup]="form" (ngSubmit)="save()">
      <h2>{{ editingId ? 'Editar plato' : 'Nuevo plato' }}</h2>
      <div class="grid">
        <label>Nombre <input formControlName="name" maxlength="100" /></label>
        <label>Precio (S/) <input type="number" step="0.10" formControlName="price" /></label>
        <label>Categoría
          <select formControlName="category">
            <option *ngFor="let c of categories" [value]="c">{{ c }}</option>
          </select>
        </label>
        <label>Imagen (URL https, opcional) <input formControlName="imageUrl" /></label>
      </div>
      <label>Descripción <textarea formControlName="description" maxlength="500"></textarea></label>
      <label class="check"><input type="checkbox" formControlName="available" /> Disponible</label>
      <small class="error" *ngIf="form.touched && form.invalid">
        Revisa el nombre (mínimo 2 letras), el precio (0.10 a 10000) y la URL (https).
      </small>
      <div class="actions">
        <button [disabled]="form.invalid || saving">Guardar</button>
        <button type="button" class="alt" *ngIf="editingId" (click)="reset()">Cancelar</button>
      </div>
    </form>

    <form class="panel grid" [formGroup]="filters" (ngSubmit)="load(1)">
      <input formControlName="search" placeholder="Buscar por nombre" maxlength="60" />
      <select formControlName="category">
        <option value="">Todas las categorías</option>
        <option *ngFor="let c of categories" [value]="c">{{ c }}</option>
      </select>
      <button>Filtrar</button>
    </form>

    <div class="panel table">
      <table>
        <tr><th>Nombre</th><th>Categoría</th><th>Precio</th><th>Disponible</th><th>Acciones</th></tr>
        <tr *ngFor="let product of products">
          <td>{{ product.name }}</td>
          <td>{{ product.category }}</td>
          <td>S/ {{ product.price | number: '1.2-2' }}</td>
          <td>{{ product.available ? 'Sí' : 'No' }}</td>
          <td class="actions">
            <button type="button" (click)="edit(product)">Editar</button>
            <button type="button" class="alt" (click)="remove(product)">Eliminar</button>
          </td>
        </tr>
      </table>
      <p *ngIf="!products.length">No hay platos para mostrar.</p>
      <div class="actions">
        <button type="button" [disabled]="page <= 1" (click)="load(page - 1)">Anterior</button>
        <span>Página {{ page }} de {{ pages || 1 }}</span>
        <button type="button" [disabled]="page >= pages" (click)="load(page + 1)">Siguiente</button>
      </div>
    </div>
  `,
})
export class ProductsComponent implements OnInit {
  private api = inject(ApiService);
  private fb = inject(FormBuilder).nonNullable;
  categories: Category[] = ['entrada', 'plato_principal', 'postre', 'bebida'];
  products: Product[] = [];
  editingId = '';
  page = 1;
  pages = 1;
  saving = false;
  error = '';

  form = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    description: [''],
    price: [10, [Validators.required, Validators.min(0.1), Validators.max(10000)]],
    category: ['plato_principal' as Category, Validators.required],
    imageUrl: ['', Validators.pattern(/^https:\/\/.+/)],
    available: [true],
  });
  filters = this.fb.group({ search: [''], category: [''] });

  ngOnInit() { this.load(1); }

  load(page: number) {
    this.error = '';
    this.api.products({ ...this.filters.getRawValue(), page, limit: 10 }).subscribe({
      next: (result) => {
        // Si se eliminó el último registro de la página, se retrocede
        if (!result.data.length && page > 1) return this.load(page - 1);
        this.products = result.data;
        this.page = result.page;
        this.pages = result.pages;
      },
      error: (e) => (this.error = errorMessage(e)),
    });
  }

  save() {
    if (this.form.invalid) return;
    this.saving = true;
    this.error = '';
    const data = this.form.getRawValue();
    const request = this.editingId
      ? this.api.updateProduct(this.editingId, data)
      : this.api.createProduct(data);
    request.pipe(finalize(() => (this.saving = false))).subscribe({
      next: () => {
        this.reset();
        this.load(this.page);
      },
      error: (e) => (this.error = errorMessage(e)),
    });
  }

  edit(product: Product) {
    this.editingId = product._id;
    this.form.patchValue(product);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  reset() {
    this.editingId = '';
    this.form.reset();
  }

  remove(product: Product) {
    if (!confirm(`¿Eliminar "${product.name}"?`)) return;
    this.api.deleteProduct(product._id).subscribe({
      next: () => {
        if (this.editingId === product._id) this.reset();
        this.load(this.page);
      },
      error: (e) => (this.error = errorMessage(e)),
    });
  }
}
