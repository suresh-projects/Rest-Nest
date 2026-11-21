import { HttpClient } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { tap } from 'rxjs';
import { API_URL } from './config';
import { AuthResponse, Role } from './models';

const KEY = 'restnest.auth';

function isExpired(token: string): boolean {
  try {
    const payload = JSON.parse(atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')));
    return typeof payload.exp === 'number' && payload.exp * 1000 < Date.now();
  } catch {
    return true;
  }
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private _user = signal<AuthResponse | null>(this.load());

  readonly user = this._user.asReadonly();
  readonly isLoggedIn = computed(() => this._user() !== null);
  readonly role = computed<Role | null>(() => this._user()?.role ?? null);

  token(): string | null {
    return this._user()?.token ?? null;
  }

  login(email: string, password: string) {
    return this.http.post<AuthResponse>(API_URL + '/api/auth/login', { email, password })
      .pipe(tap(u => this.save(u)));
  }

  register(body: { fullName: string; email: string; phone: string; password: string; role: Role }) {
    return this.http.post<AuthResponse>(API_URL + '/api/auth/register', body)
      .pipe(tap(u => this.save(u)));
  }

  logout() {
    localStorage.removeItem(KEY);
    this._user.set(null);
  }

  private save(u: AuthResponse) {
    try { localStorage.setItem(KEY, JSON.stringify(u)); } catch { /* ignore */ }
    this._user.set(u);
  }

  private load(): AuthResponse | null {
    try {
      const raw = localStorage.getItem(KEY);
      if (!raw) return null;
      const u = JSON.parse(raw) as AuthResponse;
      return u?.token && !isExpired(u.token) ? u : null;
    } catch {
      return null;
    }
  }
}
