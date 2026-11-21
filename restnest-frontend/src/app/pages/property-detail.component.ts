import { CurrencyPipe } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ApiService } from '../core/api.service';
import { AuthService } from '../core/auth.service';
import { PURPOSES, RULES } from '../core/labels';
import { Availability, BookingRequest, Property } from '../core/models';
import { IconPipe, LabelPipe, Time12Pipe } from '../core/pipes';
import { ToastService } from '../core/toast.service';
import { addDays, errMsg, imgUrl, minToHHmm, minToLabel, toIsoDate, toMin } from '../core/utils';

@Component({
  selector: 'app-property-detail',
  imports: [FormsModule, RouterLink, CurrencyPipe, LabelPipe, IconPipe, Time12Pipe],
  template: `
    @if (loading) {
      <div class="skeleton tall"></div>
    } @else if (!p) {
      <div class="empty">
        <div class="big">🏚️</div>
        <h2>Room not found</h2>
        <p class="muted">This room may have been removed or is no longer available.</p>
        <a routerLink="/" class="btn btn-primary">Browse rooms</a>
      </div>
    } @else {
      <a routerLink="/" class="back">← Back to results</a>
      <div class="detail">
        <div class="detail-main">
          <div class="gallery">
            @if (p.photos.length) {
              <img class="gallery-main" [src]="img(p.photos[active].url)" [alt]="p.title" />
              @if (p.photos.length > 1) {
                <div class="thumbs">
                  @for (ph of p.photos; track ph.id; let i = $index) {
                    <button type="button" [class.on]="i === active" (click)="active = i">
                      <img [src]="img(ph.url)" alt="" />
                    </button>
                  }
                </div>
              }
            } @else {
              <div class="gallery-main ph">🏠</div>
            }
          </div>

          <h1>{{ p.title }}</h1>
          <p class="muted">
            📍 {{ p.area }}@if (p.nearestHub !== 'NONE') { · near {{ p.nearestHub | label: 'hub' }} }
            · Hosted by <strong>{{ p.hostName }}</strong>
          </p>

          <div class="facts">
            <div><small>Price</small><strong>{{ p.pricePerHour | currency: 'INR' : 'symbol' : '1.0-0' }}/hr</strong></div>
            <div><small>Max guests</small><strong>{{ p.maxGuests }}</strong></div>
            <div><small>Minimum</small><strong>{{ p.minHours }} hr</strong></div>
            <div><small>Open</small><strong>{{ p.availableFrom | time12 }} – {{ p.availableTo | time12 }}</strong></div>
          </div>

          @if (p.description) {
            <h3>About this room</h3>
            <p class="pre">{{ p.description }}</p>
          }

          @if (p.amenities.length) {
            <h3>Amenities</h3>
            <ul class="list">
              @for (a of p.amenities; track a) { <li>{{ a | icon: 'amenity' }} {{ a | label: 'amenity' }}</li> }
            </ul>
          }

          <h3>House rules</h3>
          @if (p.houseRules.length) {
            <ul class="list rules">
              @for (r of p.houseRules; track r) { <li>{{ r | icon: 'rule' }} {{ r | label: 'rule' }}</li> }
            </ul>
          } @else {
            <p class="muted">The host has not added special rules.</p>
          }

          <div class="alert info">🔒 For safety, the full address and phone numbers are shared only after the host confirms your booking.</div>
        </div>

        <aside class="book-card card">
          <div class="row between">
            <h3>Book this room</h3>
            <strong>{{ p.pricePerHour | currency: 'INR' : 'symbol' : '1.0-0' }}<small class="muted">/hr</small></strong>
          </div>

          @if (!auth.isLoggedIn()) {
            <p class="muted">Login as a guest to request a booking.</p>
            <a class="btn btn-primary block" routerLink="/login" [queryParams]="{ returnUrl: '/property/' + p.id }">Login to book</a>
            <p class="center muted">No account? <a routerLink="/register">Sign up</a></p>
          } @else if (auth.role() !== 'GUEST') {
            <div class="alert warn">Host accounts cannot make bookings. Login with a guest account to book a room.</div>
          } @else {
            <label class="field">
              <span>Date</span>
              <input type="date" [min]="today" [max]="maxDate" [ngModel]="date" (ngModelChange)="onDate($event)" />
            </label>

            <label class="field">
              <span>How many hours?</span>
              <select [ngModel]="hours" (ngModelChange)="onHours($event)">
                @for (h of hourOptions; track h) { <option [ngValue]="h">{{ h }} hour{{ h > 1 ? 's' : '' }}</option> }
              </select>
            </label>

            <div class="field">
              <span>Start time</span>
              @if (avLoading) {
                <div class="skeleton"></div>
              } @else if (av) {
                <div class="slots">
                  @for (s of starts(); track s) {
                    <button type="button" class="slot" [class.sel]="startMin === s" [disabled]="!slotOk(s)" (click)="startMin = s">
                      {{ label(s) }}
                    </button>
                  }
                </div>
                <small class="muted">Greyed-out times are booked, too late for this duration, or too soon.</small>
              }
            </div>

            <div class="two">
              <label class="field">
                <span>Guests</span>
                <input type="number" min="1" [max]="p.maxGuests" [(ngModel)]="guests" />
              </label>
              <label class="field">
                <span>Purpose</span>
                <select [(ngModel)]="purpose">
                  @for (o of purposes; track o.code) { <option [value]="o.code">{{ o.label }}</option> }
                </select>
              </label>
            </div>

            <label class="field">
              <span>Note for host (optional)</span>
              <textarea rows="2" maxlength="500" placeholder="E.g. travelling with 2 kids, train at 4 PM" [(ngModel)]="note"></textarea>
            </label>

            <label class="check">
              <input type="checkbox" [(ngModel)]="agree" />
              <span>I agree to follow the house rules
                @if (p.houseRules.length) { ({{ ruleText() }}) }
              </span>
            </label>

            @if (startMin !== null) {
              <div class="summary">
                <div>{{ label(startMin) }} – {{ label(startMin + hours * 60) }} · {{ hours }} hr</div>
                <strong>Total {{ p.pricePerHour * hours | currency: 'INR' : 'symbol' : '1.0-0' }}</strong>
              </div>
            }

            <button type="button" class="btn btn-primary block" [disabled]="submitting || startMin === null || !agree" (click)="book()">
              {{ submitting ? 'Sending request…' : 'Request booking' }}
            </button>
            <p class="muted center small">The host will confirm your request. You pay at the room (online payment coming soon).</p>
          }
        </aside>
      </div>
    }
  `,
})
export class PropertyDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private api = inject(ApiService);
  private router = inject(Router);
  private toast = inject(ToastService);
  auth = inject(AuthService);

  p: Property | null = null;
  loading = true;
  active = 0;
  img = imgUrl;
  purposes = PURPOSES;

  today = toIsoDate(new Date());
  maxDate = toIsoDate(addDays(new Date(), 60));
  date = this.today;
  hours = 1;
  startMin: number | null = null;
  guests = 1;
  purpose = 'TRAVEL_REST';
  note = '';
  agree = false;

  av: Availability | null = null;
  avLoading = false;
  submitting = false;

  ngOnInit() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.api.property(id).subscribe({
      next: p => {
        this.p = p;
        this.hours = p.minHours;
        this.loading = false;
        this.loadAvailability();
      },
      error: () => { this.loading = false; },
    });
  }

  get hourOptions(): number[] {
    const min = this.p?.minHours ?? 1;
    return Array.from({ length: Math.max(0, 6 - min + 1) }, (_, i) => min + i);
  }

  label(min: number): string { return minToLabel(min); }

  ruleText(): string {
    const names = this.p?.houseRules.map(r => RULES.find(x => x.code === r)?.label ?? r) ?? [];
    return names.join(', ');
  }

  onDate(d: string) {
    this.date = d || this.today;
    this.startMin = null;
    this.loadAvailability();
  }

  onHours(h: number) {
    this.hours = h;
    if (this.startMin !== null && !this.slotOk(this.startMin)) this.startMin = null;
  }

  loadAvailability() {
    if (!this.p) return;
    this.avLoading = true;
    this.api.availability(this.p.id, this.date).subscribe({
      next: a => { this.av = a; this.avLoading = false; },
      error: e => { this.avLoading = false; this.toast.error(errMsg(e)); },
    });
  }

  /** 30 min steps from opening time till (closing - 30 min) */
  starts(): number[] {
    if (!this.av) return [];
    const from = toMin(this.av.availableFrom);
    const to = toMin(this.av.availableTo);
    const out: number[] = [];
    for (let m = from; m + 30 <= to; m += 30) out.push(m);
    return out;
  }

  slotOk(s: number): boolean {
    if (!this.av) return false;
    const end = s + this.hours * 60;
    if (end > toMin(this.av.availableTo)) return false;
    if (this.av.bookedSlots.some(b => s < toMin(b.endTime) && end > toMin(b.startTime))) return false;
    if (this.date === this.today) {
      const now = new Date();
      if (s < now.getHours() * 60 + now.getMinutes() + 30) return false;
    }
    return true;
  }

  book() {
    if (!this.p || this.startMin === null) return;
    if (!this.guests || this.guests < 1 || this.guests > this.p.maxGuests) {
      this.toast.error('Guests must be between 1 and ' + this.p.maxGuests + '.');
      return;
    }
    const req: BookingRequest = {
      propertyId: this.p.id, date: this.date, startTime: minToHHmm(this.startMin),
      hours: this.hours, guests: this.guests, purpose: this.purpose,
      note: this.note.trim() || null, rulesAccepted: this.agree,
    };
    this.submitting = true;
    this.api.createBooking(req).subscribe({
      next: () => {
        this.toast.success('Booking requested! The host will confirm soon.');
        this.router.navigate(['/my-bookings']);
      },
      error: e => {
        this.submitting = false;
        this.toast.error(errMsg(e));
        this.startMin = null;
        this.loadAvailability();
      },
    });
  }
}
