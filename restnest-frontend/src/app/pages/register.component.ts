import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../core/auth.service';
import { Role } from '../core/models';
import { errMsg } from '../core/utils';

@Component({
  selector: 'app-register',
  imports: [FormsModule, RouterLink],
  template: `
    <div class="auth-card card">
      <h1>Create your account</h1>
      <div class="role-pick">
        <button type="button" class="role" [class.on]="role === 'GUEST'" (click)="role = 'GUEST'">
          <span>🧳</span><strong>I need a room</strong><small>Book hourly rest rooms</small>
        </button>
        <button type="button" class="role" [class.on]="role === 'HOST'" (click)="role = 'HOST'">
          <span>🏠</span><strong>I have a room</strong><small>Earn by hosting families</small>
        </button>
      </div>
      @if (error) { <div class="alert err">{{ error }}</div> }
      <label class="field">
        <span>Full name</span>
        <input type="text" name="fullName" [(ngModel)]="fullName" />
      </label>
      <label class="field">
        <span>Email</span>
        <input type="email" name="email" autocomplete="email" [(ngModel)]="email" />
      </label>
      <label class="field">
        <span>Mobile number</span>
        <input type="tel" name="phone" inputmode="numeric" maxlength="10" placeholder="10 digit number" [(ngModel)]="phone" />
      </label>
      <label class="field">
        <span>Password (min 8 characters)</span>
        <input type="password" name="password" autocomplete="new-password" [(ngModel)]="password" (keyup.enter)="submit()" />
      </label>
      <button type="button" class="btn btn-primary block" [disabled]="loading" (click)="submit()">
        {{ loading ? 'Creating…' : 'Sign up as ' + (role === 'HOST' ? 'Host' : 'Guest') }}
      </button>
      <p class="center muted">Already have an account? <a routerLink="/login">Login</a></p>
    </div>
  `,
})
export class RegisterComponent {
  private auth = inject(AuthService);
  private router = inject(Router);

  role: Role = 'GUEST';
  fullName = '';
  email = '';
  phone = '';
  password = '';
  loading = false;
  error = '';

  submit() {
    this.error = '';
    if (this.fullName.trim().length < 2) { this.error = 'Enter your full name.'; return; }
    if (!/^\S+@\S+\.\S+$/.test(this.email.trim())) { this.error = 'Enter a valid email.'; return; }
    if (!/^[6-9]\d{9}$/.test(this.phone)) { this.error = 'Enter a valid 10 digit Indian mobile number.'; return; }
    if (this.password.length < 8) { this.error = 'Password must be at least 8 characters.'; return; }

    this.loading = true;
    this.auth.register({
      fullName: this.fullName.trim(), email: this.email.trim(), phone: this.phone,
      password: this.password, role: this.role,
    }).subscribe({
      next: u => this.router.navigateByUrl(u.role === 'HOST' ? '/host' : '/'),
      error: e => { this.loading = false; this.error = errMsg(e); },
    });
  }
}
