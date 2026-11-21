import { Component, OnInit, inject } from '@angular/core';
import { ApiService } from '../core/api.service';
import { BookingActions } from '../core/booking-actions';
import { STATUSES } from '../core/labels';
import { Booking } from '../core/models';
import { errMsg } from '../core/utils';
import { BookingActionType, BookingCardComponent } from '../shared/booking-card.component';

@Component({
  selector: 'app-host-bookings',
  imports: [BookingCardComponent],
  template: `
    <div class="row between wrap">
      <h1>Booking requests</h1>
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
          <app-booking-card [b]="b" mode="host" (action)="onAction($event)" />
        }
      </div>
    } @else {
      <div class="empty">
        <div class="big">📭</div>
        <h3>No requests here</h3>
        <p class="muted">New booking requests from families will show up here.</p>
      </div>
    }
  `,
})
export class HostBookingsComponent implements OnInit {
  private api = inject(ApiService);
  private actions = inject(BookingActions);

  statuses = STATUSES;
  all: Booking[] = [];
  filter = 'PENDING';
  loading = true;
  error = '';

  ngOnInit() { this.load(); }

  load() {
    this.api.hostBookings().subscribe({
      next: l => { this.all = l; this.loading = false; this.error = ''; },
      error: e => { this.loading = false; this.error = errMsg(e); },
    });
  }

  shown(): Booking[] { return this.filter ? this.all.filter(b => b.status === this.filter) : this.all; }
  count(s: string): number { return this.all.filter(b => b.status === s).length; }

  async onAction(e: { type: BookingActionType; booking: Booking }) {
    let changed = false;
    if (e.type === 'confirm') changed = await this.actions.hostConfirm(e.booking);
    else if (e.type === 'reject') changed = await this.actions.hostReject(e.booking);
    else changed = await this.actions.hostCancel(e.booking);
    if (changed) this.load();
  }
}
