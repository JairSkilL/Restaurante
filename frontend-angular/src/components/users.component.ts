import { Component, OnInit, inject } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ApiService } from '../services/api.service';
import { AuthService } from '../services/auth.service';
import { errorMessage } from '../services/error-message';
import { Role, User } from '../app/models';

@Component({
  standalone: true,
  imports: [NgIf, NgFor, ReactiveFormsModule],
  template: `
    <h1>Usuarios y clientes</h1>
    <p class="error" *ngIf="error">{{ error }}</p>

    <form class="panel" *ngIf="editing" [formGroup]="form" (ngSubmit)="save()">
      <h2>Editar {{ editing.email }}</h2>
      <div class="grid">
        <label>Nombre <input formControlName="name" maxlength="80" /></label>
        <label>Rol
          <select formControlName="role">
            <option value="cliente">cliente</option>
            <option value="admin">admin</option>
          </select>
        </label>
        <label class="check"><input type="checkbox" formControlName="active" /> Activo</label>
      </div>
      <div class="actions">
        <button [disabled]="form.invalid">Guardar</button>
        <button type="button" class="alt" (click)="editing = undefined">Cancelar</button>
      </div>
    </form>

    <div class="panel table">
      <table>
        <tr><th>Nombre</th><th>Correo</th><th>Rol</th><th>Activo</th><th>Acciones</th></tr>
        <tr *ngFor="let user of users">
          <td>{{ user.name }}</td>
          <td>{{ user.email }}</td>
          <td>{{ user.role }}</td>
          <td>{{ user.active ? 'Sí' : 'No' }}</td>
          <td class="actions">
            <!-- La propia cuenta no se edita desde aquí -->
            <ng-container *ngIf="user._id !== auth.user?.id">
              <button type="button" (click)="edit(user)">Editar</button>
              <button type="button" class="alt" *ngIf="user.active" (click)="deactivate(user)">
                Desactivar
              </button>
            </ng-container>
          </td>
        </tr>
      </table>
    </div>
  `,
})
export class UsersComponent implements OnInit {
  private api = inject(ApiService);
  auth = inject(AuthService);
  users: User[] = [];
  editing?: User;
  error = '';
  form = inject(FormBuilder).nonNullable.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    role: ['cliente' as Role],
    active: [true],
  });

  ngOnInit() { this.load(); }

  load() {
    this.api.users().subscribe({
      next: (users) => (this.users = users),
      error: (e) => (this.error = errorMessage(e)),
    });
  }

  edit(user: User) {
    this.editing = user;
    this.form.patchValue(user);
  }

  save() {
    if (!this.editing || this.form.invalid) return;
    this.error = '';
    this.api.updateUser(this.editing._id, this.form.getRawValue()).subscribe({
      next: () => {
        this.editing = undefined;
        this.load();
      },
      error: (e) => (this.error = errorMessage(e)),
    });
  }

  deactivate(user: User) {
    if (!confirm(`¿Desactivar a ${user.name}?`)) return;
    this.error = '';
    this.api.deactivateUser(user._id).subscribe({
      next: () => {
        if (this.editing?._id === user._id) this.editing = undefined;
        this.load();
      },
      error: (e) => (this.error = errorMessage(e)),
    });
  }
}
