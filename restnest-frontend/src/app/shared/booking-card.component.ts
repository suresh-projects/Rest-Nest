import { CurrencyPipe, DatePipe } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Booking } from '../core/models';
import { LabelPipe, Time12Pipe } from '../core/pipes';

export type BookingActionType = 'cancel' | 'confirm' | 'reject';

@Component({
  selector: 'app-booking-card',
  imports: [RouterLink, CurrencyPipe, DatePipe, LabelPipe, Time12Pipe],
  template: `
    <article class="card bk">
      <div class="bk-head">
        <div>
          <h3><a [routerLink]="['/property', b.propertyId]">{{ b.propertyTitle }}</a></h3>
          <p class="muted">📍 {{ b.area }} · Booking #{{ b.id }}</p>
        </div>
        <span [class]="'badge ' + b.status">{{ b.status | label: 'status' }}</span>
      </div>

      <div class="bk-grid">
        <div><small>Date</small><strong>{{ b.date | date: 'EEE, d MMM y' }}</strong></div>
        <div><small>Time</small><strong>{{ b.startTime | time12 }} – {{ b.endTime | time12 }}</strong></div>
        <div><small>Duration</small><strong>{{ b.hours }} hr</strong></div>
        <div><small>Guests</small><strong>{{ b.guests }}</strong></div>
        <div><small>Purpose</small><strong>{{ b.purpose | label: 'purpose' }}</strong></div>
        <div><small>Amount</small><strong>{{ b.totalAmount | currency: 'INR' : 'symbol' : '1.0-0' }}</strong></div>
      </div>

      @if (b.note) { <p class="note">“{{ b.note }}”</p> }

      @if (mode === 'guest') {
        @if (b.status === 'CONFIRMED') {
          <div class="alert ok">
            <strong>Confirmed! Here are your host details</strong>
            <div>📍 {{ b.address }}</div>
            <div>Host: {{ b.hostName }}@if (b.hostPhone) { · <a [href]="'tel:' + b.hostPhone">📞 {{ b.hostPhone }}</a> }</div>
          </div>
        } @else if (b.status === 'PENDING') {
          <div class="alert warn">Waiting for the host to confirm. The full address is shared after confirmation.</div>
        }
      } @else {
        <div class="alert info">
          Guest: <strong>{{ b.guestName }}</strong>
          @if (b.guestPhone) { · <a [href]="'tel:' + b.guestPhone">📞 {{ b.guestPhone }}</a> }
          @else { <span class="muted"> · phone is shown after you confirm</span> }
        </div>
      }

      @if (b.statusReason) { <p class="muted">Reason: {{ b.statusReason }}</p> }

      <div class="actions">
        @if (mode === 'guest') {
          @if (b.status === 'PENDING' || b.status === 'CONFIRMED') {
            <button type="button" class="btn btn-ghost btn-sm danger-text" (click)="act('cancel')">Cancel booking</button>
          }
        } @else {
          @if (b.status === 'PENDING') {
            <button type="button" class="btn btn-primary btn-sm" (click)="act('confirm')">Confirm</button>
            <button type="button" class="btn btn-ghost btn-sm danger-text" (click)="act('reject')">Reject</button>
          } @else if (b.status === 'CONFIRMED') {
            <button type="button" class="btn btn-ghost btn-sm danger-text" (click)="act('cancel')">Cancel booking</button>
          }
        }
      </div>
    </article>
  `,
})
export class BookingCardComponent {
  @Input({ required: true }) b!: Booking;
  @Input() mode: 'guest' | 'host' = 'guest';
  @Output() action = new EventEmitter<{ type: BookingActionType; booking: Booking }>();

  act(type: BookingActionType) {
    this.action.emit({ type, booking: this.b });
  }
}
