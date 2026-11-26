import { Component, inject } from '@angular/core';
import { NgIf } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { errorMessage } from '../services/error-message';

@Component({
  standalone: true,
  imports: [NgIf, ReactiveFormsModule, RouterLink],
  template: `
    <form class="panel auth" [formGroup]="form" (ngSubmit)="submit()">
      <h1>Crear cuenta</h1>
      <p>La cuenta se crea como cliente. Un administrador puede cambiar su rol.</p>
      <label>Nombre <input formControlName="name" maxlength="80" /></label>
      <label>Correo <input type="email" formControlName="email" /></label>
      <label>Contraseña (mínimo 8 caracteres)
        <input type="password" formControlName="password" autocomplete="new-password" />
      </label>
      <p class="error" *ngIf="error">{{ error }}</p>
      <p class="ok" *ngIf="success">{{ success }}</p>
      <button [disabled]="form.invalid || loading">Registrarme</button>
      <p><a routerLink="/login">Volver a iniciar sesión</a></p>
    </form>
  `,
})
export class RegisterComponent {
  private auth = inject(AuthService);
  form = inject(FormBuilder).nonNullable.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8), Validators.maxLength(72)]],
  });
  loading = false;
  error = '';
  success = '';

  submit() {
    if (this.form.invalid) return;
    this.loading = true;
    this.error = this.success = '';
    this.auth
      .register(this.form.getRawValue())
      .pipe(finalize(() => (this.loading = false)))
      .subscribe({
        next: () => {
          this.success = 'Cuenta creada correctamente';
          this.form.reset();
        },
        error: (e) => (this.error = errorMessage(e)),
      });
  }
}
