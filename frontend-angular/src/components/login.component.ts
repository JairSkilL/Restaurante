import { Component, inject } from '@angular/core';
import { NgIf } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { errorMessage } from '../services/error-message';

@Component({
  standalone: true,
  imports: [NgIf, ReactiveFormsModule, RouterLink],
  template: `
    <form class="panel auth" [formGroup]="form" (ngSubmit)="submit()">
      <h1>Panel del restaurante</h1>
      <label>Correo <input type="email" formControlName="email" autocomplete="username" /></label>
      <label>Contraseña
        <input type="password" formControlName="password" autocomplete="current-password" />
      </label>
      <p class="error" *ngIf="error">{{ error }}</p>
      <button [disabled]="form.invalid || loading">Iniciar sesión</button>
      <p><a routerLink="/registro">Crear una cuenta</a></p>
    </form>
  `,
})
export class LoginComponent {
  private auth = inject(AuthService);
  private router = inject(Router);
  form = inject(FormBuilder).nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required],
  });
  loading = false;
  error = '';

  submit() {
    if (this.form.invalid) return;
    this.loading = true;
    this.error = '';
    const { email, password } = this.form.getRawValue();
    this.auth
      .login(email, password)
      .pipe(finalize(() => (this.loading = false)))
      .subscribe({
        next: ({ user }) => {
          if (user.role === 'admin') this.router.navigate(['/dashboard']);
          else this.error = 'Este panel es solo para administradores';
        },
        error: (e) => (this.error = errorMessage(e)),
      });
  }
}
