import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from './core/auth.service';
import { DialogService } from './core/dialog.service';
import { ToastService } from './core/toast.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, FormsModule],
  template: `
    <header class="nav">
      <div class="container nav-inner">
        <a routerLink="/" class="brand" (click)="open = false">🪺 Rest<span>Nest</span></a>
        <button class="burger" type="button" aria-label="Menu" (click)="open = !open">☰</button>
        <nav [class.open]="open" (click)="open = false">
          <a routerLink="/" routerLinkActive="active" [routerLinkActiveOptions]="{ exact: true }">Find a room</a>
          @if (auth.role() === 'GUEST') {
            <a routerLink="/my-bookings" routerLinkActive="active">My bookings</a>
          }
          @if (auth.role() === 'HOST') {
            <a routerLink="/host" routerLinkActive="active" [routerLinkActiveOptions]="{ exact: true }">Dashboard</a>
            <a routerLink="/host/properties" routerLinkActive="active">My rooms</a>
            <a routerLink="/host/bookings" routerLinkActive="active">Requests</a>
          }
          <span class="spacer"></span>
          @if (auth.user(); as u) {
            <span class="user">👤 {{ u.fullName }} <small>({{ u.role }})</small></span>
            <button type="button" class="btn btn-ghost btn-sm" (click)="logout()">Logout</button>
          } @else {
            <a routerLink="/login" class="btn btn-ghost btn-sm">Login</a>
            <a routerLink="/register" class="btn btn-primary btn-sm">Sign up</a>
          }
        </nav>
      </div>
    </header>

    <main class="container page">
      <router-outlet />
    </main>

    <footer class="footer">
      <div class="container">🪺 RestNest · Hourly home rest rooms for travelling families in Chennai</div>
    </footer>

    <div class="toasts">
      @for (t of toast.toasts(); track t.id) {
        <div class="toast" [class.err]="t.type === 'err'" (click)="toast.dismiss(t.id)">{{ t.text }}</div>
      }
    </div>

    @if (dialog.state(); as d) {
      <div class="overlay" (click)="done(false)">
        <div class="modal" (click)="$event.stopPropagation()">
          <h3>{{ d.title }}</h3>
          @if (d.message) { <p class="muted">{{ d.message }}</p> }
          @if (d.withReason) {
            <label class="field">
              <span>Reason (optional)</span>
              <textarea rows="3" maxlength="300" [(ngModel)]="reason" placeholder="Tell the other person why"></textarea>
            </label>
          }
          <div class="actions end">
            <button type="button" class="btn btn-ghost" (click)="done(false)">Back</button>
            <button type="button" class="btn" [class.btn-danger]="d.danger" [class.btn-primary]="!d.danger" (click)="done(true)">
              {{ d.confirmText || 'OK' }}
            </button>
          </div>
        </div>
      </div>
    }
  `,
})
export class AppComponent {
  auth = inject(AuthService);
  toast = inject(ToastService);
  dialog = inject(DialogService);
  private router = inject(Router);

  open = false;
  reason = '';

  logout() {
    this.auth.logout();
    this.open = false;
    this.router.navigate(['/']);
  }

  done(ok: boolean) {
    const reason = this.reason;
    this.reason = '';
    this.dialog.close({ ok, reason });
  }
}
