import { Component, OnInit, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';
import { ApiService } from '../core/api.service';
import { AuthService } from '../core/auth.service';
import { BookingActions } from '../core/booking-actions';
import { Booking, Property } from '../core/models';
import { errMsg } from '../core/utils';
import { BookingActionType, BookingCardComponent } from '../shared/booking-card.component';

@Component({
  selector: 'app-host-dashboard',
  imports: [RouterLink, BookingCardComponent],
  template: `
    <div class="row between wrap">
      <div>
        <h1>Hi {{ auth.user()?.fullName }} 👋</h1>
        <p class="muted">Here is what is happening with your rooms.</p>
      </div>
      <a routerLink="/host/properties/new" class="btn btn-primary">+ Add a room</a>
    </div>

    @if (error) { <div class="alert err">{{ error }}</div> }

    @if (loading) {
      <div class="skeleton tall"></div>
    } @else {
      <div class="stats">
        <a class="stat card" routerLink="/host/properties"><small>Active rooms</small><strong>{{ activeCount }}</strong><span>of {{ props.length }} total</span></a>
        <a class="stat card" routerLink="/host/bookings"><small>Pending requests</small><strong [class.hot]="pending.length > 0">{{ pending.length }}</strong><span>need your reply</span></a>
        <a class="stat card" routerLink="/host/bookings"><small>Upcoming confirmed</small><strong>{{ upcoming }}</strong><span>guests coming</span></a>
        <div class="stat card"><small>Confirmed earnings</small><strong>₹{{ earnings }}</strong><span>all confirmed bookings</span></div>
      </div>

      @if (!props.length) {
        <div class="empty">
          <div class="big">🏠</div>
          <h3>Add your first room</h3>
          <p class="muted">Share a spare room by the hour with travelling families and set your own house rules.</p>
          <a routerLink="/host/properties/new" class="btn btn-primary">Add a room</a>
        </div>
      }

      <h2>Pending requests</h2>
      @if (pending.length) {
        <div class="stack">
          @for (b of pending; track b.id) {
            <app-booking-card [b]="b" mode="host" (action)="onAction($event)" />
          }
        </div>
      } @else {
        <p class="muted">No pending requests right now.</p>
      }
    }
  `,
})
export class HostDashboardComponent implements OnInit {
  private api = inject(ApiService);
  private actions = inject(BookingActions);
  auth = inject(AuthService);

  props: Property[] = [];
  bookings: Booking[] = [];
  loading = true;
  error = '';

  ngOnInit() { this.load(); }

  load() {
    forkJoin({ p: this.api.hostProperties(), b: this.api.hostBookings() }).subscribe({
      next: r => { this.props = r.p; this.bookings = r.b; this.loading = false; this.error = ''; },
      error: e => { this.loading = false; this.error = errMsg(e); },
    });
  }

  get activeCount() { return this.props.filter(p => p.active).length; }
  get pending() { return this.bookings.filter(b => b.status === 'PENDING'); }
  get upcoming() {
    const today = new Date().toISOString().slice(0, 10);
    return this.bookings.filter(b => b.status === 'CONFIRMED' && b.date >= today).length;
  }
  get earnings() {
    return this.bookings.filter(b => b.status === 'CONFIRMED').reduce((s, b) => s + Number(b.totalAmount), 0);
  }

  async onAction(e: { type: BookingActionType; booking: Booking }) {
    let changed = false;
    if (e.type === 'confirm') changed = await this.actions.hostConfirm(e.booking);
    else if (e.type === 'reject') changed = await this.actions.hostReject(e.booking);
    else changed = await this.actions.hostCancel(e.booking);
    if (changed) this.load();
  }
}
