import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../core/auth.service';
import { errMsg } from '../core/utils';

@Component({
  selector: 'app-login',
  imports: [FormsModule, RouterLink],
  template: `
    <div class="auth-card card">
      <h1>Welcome back</h1>
      <p class="muted">Login to book a room or manage your listings.</p>
      @if (error) { <div class="alert err">{{ error }}</div> }
      <label class="field">
        <span>Email</span>
        <input type="email" name="email" autocomplete="email" [(ngModel)]="email" (keyup.enter)="submit()" />
      </label>
      <label class="field">
        <span>Password</span>
        <input type="password" name="password" autocomplete="current-password" [(ngModel)]="password" (keyup.enter)="submit()" />
      </label>
      <button type="button" class="btn btn-primary block" [disabled]="loading" (click)="submit()">
        {{ loading ? 'Logging in…' : 'Login' }}
      </button>
      <p class="center muted">New here? <a routerLink="/register">Create an account</a></p>
    </div>
  `,
})
export class LoginComponent {
  private auth = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  email = '';
  password = '';
  loading = false;
  error = '';

  submit() {
    this.error = '';
    if (!this.email.trim() || !this.password) {
      this.error = 'Enter your email and password.';
      return;
    }
    this.loading = true;
    this.auth.login(this.email.trim(), this.password).subscribe({
      next: u => {
        const ret = this.route.snapshot.queryParamMap.get('returnUrl');
        const safe = ret && ret.startsWith('/') && !ret.startsWith('//') ? ret : null;
        this.router.navigateByUrl(safe ?? (u.role === 'HOST' ? '/host' : '/'));
      },
      error: e => {
        this.loading = false;
        this.error = e.status === 401 ? 'Wrong email or password.' : errMsg(e);
      },
    });
  }
}
