import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { finalize, tap } from 'rxjs';
import { environment } from '../environments/environment';
import { Session } from '../app/models';

const KEY = 'restaurante_admin_session';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);
  private url = `${environment.apiUrl}/auth`;
  private session: Session | null = this.restore();

  get token() { return this.session?.token ?? null; }
  get user() { return this.session?.user ?? null; }
  get isAdmin() { return this.user?.role === 'admin'; }

  login(email: string, password: string) {
    return this.http.post<Session>(`${this.url}/login`, { email, password }).pipe(
      tap((session) => {
        if (session.user.role !== 'admin') return;
        this.session = session;
        sessionStorage.setItem(KEY, JSON.stringify(session));
      }),
    );
  }

  // Crea una cuenta de cliente; no inicia sesión en el panel
  register(data: { name: string; email: string; password: string }) {
    return this.http.post<Session>(`${this.url}/register`, data);
  }

  logout() {
    this.http
      .post(`${this.url}/logout`, {})
      .pipe(finalize(() => this.clear()))
      .subscribe({ error: () => undefined });
  }

  clear() {
    this.session = null;
    sessionStorage.removeItem(KEY);
    this.router.navigate(['/login']);
  }

  private restore(): Session | null {
    try {
      return JSON.parse(sessionStorage.getItem(KEY) ?? 'null');
    } catch {
      return null;
    }
  }
}
