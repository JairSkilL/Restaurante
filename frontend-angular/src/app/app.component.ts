import { Component, inject } from '@angular/core';
import { NgIf } from '@angular/common';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [NgIf, RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <div [class.layout]="auth.isAdmin">
      <nav *ngIf="auth.isAdmin">
        <strong>{{ auth.user?.name }}</strong>
        <a routerLink="/dashboard" routerLinkActive="active">Dashboard</a>
        <a routerLink="/platos" routerLinkActive="active">Platos</a>
        <a routerLink="/pedidos" routerLinkActive="active">Pedidos</a>
        <a routerLink="/usuarios" routerLinkActive="active">Usuarios</a>
        <button type="button" (click)="auth.logout()">Cerrar sesión</button>
      </nav>
      <main><router-outlet></router-outlet></main>
    </div>
  `,
})
export class AppComponent {
  auth = inject(AuthService);
}
