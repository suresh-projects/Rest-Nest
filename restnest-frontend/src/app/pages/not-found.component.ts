import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-not-found',
  imports: [RouterLink],
  template: `
    <div class="empty">
      <div class="big">🧭</div>
      <h2>Page not found</h2>
      <p class="muted">The page you are looking for does not exist.</p>
      <a routerLink="/" class="btn btn-primary">Back to home</a>
    </div>
  `,
})
export class NotFoundComponent {}
