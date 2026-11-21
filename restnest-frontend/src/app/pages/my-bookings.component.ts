import { Component, OnInit, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ApiService } from '../core/api.service';
import { BookingActions } from '../core/booking-actions';
import { STATUSES } from '../core/labels';
import { Booking } from '../core/models';
import { errMsg } from '../core/utils';
import { BookingActionType, BookingCardComponent } from '../shared/booking-card.component';

@Component({
  selector: 'app-my-bookings',
  imports: [RouterLink, BookingCardComponent],
  template: `
    <div class="row between wrap">
      <h1>My bookings</h1>
      <button type="button" class="btn btn-ghost btn-sm" (click)="load()">↻ Refresh</button>
    </div>

    <div class="chips tabs">
      <button type="button" class="chip" [class.on]="filter === ''" (click)="filter = ''">All ({{ all.length }})</button>
      @for (s of statuses; track s.code) {
        <button type="button" class="chip" [class.on]="filter === s.code" (click)="filter = s.code">
          {{ s.label }} ({{ count(s.code) }})
        </button>
      }
    </div>

    @if (error) { <div class="alert err">{{ error }}</div> }

    @if (loading) {
      <div class="skeleton tall"></div>
    } @else if (shown().length) {
      <div class="stack">
        @for (b of shown(); track b.id) {
          <app-booking-card [b]="b" mode="guest" (action)="onAction($event)" />
        }
      </div>
    } @else {
      <div class="empty">
        <div class="big">🧳</div>
        <h3>No bookings here yet</h3>
        <p class="muted">Find a room near your station or bus stand and book by the hour.</p>
        <a routerLink="/" class="btn btn-primary">Find a room</a>
      </div>
    }
  `,
})
export class MyBookingsComponent implements OnInit {
  private api = inject(ApiService);
  private actions = inject(BookingActions);

  statuses = STATUSES;
  all: Booking[] = [];
  filter = '';
  loading = true;
  error = '';

  ngOnInit() { this.load(); }

  load() {
    this.api.myBookings().subscribe({
      next: l => { this.all = l; this.loading = false; this.error = ''; },
      error: e => { this.loading = false; this.error = errMsg(e); },
    });
  }

  shown(): Booking[] { return this.filter ? this.all.filter(b => b.status === this.filter) : this.all; }
  count(s: string): number { return this.all.filter(b => b.status === s).length; }

  async onAction(e: { type: BookingActionType; booking: Booking }) {
    if (e.type === 'cancel' && (await this.actions.guestCancel(e.booking))) this.load();
  }
}
