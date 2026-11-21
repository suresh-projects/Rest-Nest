import { CurrencyPipe } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { ApiService } from '../core/api.service';
import { DialogService } from '../core/dialog.service';
import { Property, PropertyRequest } from '../core/models';
import { ToastService } from '../core/toast.service';
import { errMsg, imgUrl } from '../core/utils';

export function toRequest(p: Property, active?: boolean): PropertyRequest {
  return {
    title: p.title, description: p.description ?? '', area: p.area, address: p.address ?? '',
    nearestHub: p.nearestHub, pricePerHour: p.pricePerHour, maxGuests: p.maxGuests, minHours: p.minHours,
    availableFrom: p.availableFrom.slice(0, 5), availableTo: p.availableTo.slice(0, 5),
    amenities: p.amenities, houseRules: p.houseRules, active,
  };
}

@Component({
  selector: 'app-host-properties',
  imports: [RouterLink, CurrencyPipe],
  template: `
    <div class="row between wrap">
      <h1>My rooms</h1>
      <a routerLink="/host/properties/new" class="btn btn-primary">+ Add a room</a>
    </div>

    @if (error) { <div class="alert err">{{ error }}</div> }

    @if (loading) {
      <div class="skeleton tall"></div>
    } @else if (list.length) {
      <div class="stack">
        @for (p of list; track p.id) {
          <article class="card hp">
            <div class="hp-thumb">
              @if (p.photos.length) { <img [src]="img(p.photos[0].url)" [alt]="p.title" /> } @else { <div class="ph">🏠</div> }
            </div>
            <div class="hp-body">
              <div class="row between wrap">
                <h3>{{ p.title }}</h3>
                <span [class]="'badge ' + (p.active ? 'CONFIRMED' : 'CANCELLED')">{{ p.active ? 'Active' : 'Inactive' }}</span>
              </div>
              <p class="muted">📍 {{ p.area }} · {{ p.pricePerHour | currency: 'INR' : 'symbol' : '1.0-0' }}/hr · up to {{ p.maxGuests }} guests · {{ p.photos.length }} photo(s)</p>
              <div class="actions">
                <a class="btn btn-ghost btn-sm" [routerLink]="['/property', p.id]">View</a>
                <a class="btn btn-ghost btn-sm" [routerLink]="['/host/properties', p.id, 'edit']">Edit</a>
                @if (p.active) {
                  <button type="button" class="btn btn-ghost btn-sm danger-text" (click)="deactivate(p)">Deactivate</button>
                } @else {
                  <button type="button" class="btn btn-primary btn-sm" (click)="activate(p)">Activate</button>
                }
              </div>
            </div>
          </article>
        }
      </div>
    } @else {
      <div class="empty">
        <div class="big">🏠</div>
        <h3>No rooms yet</h3>
        <p class="muted">Add a room and start hosting travelling families by the hour.</p>
        <a routerLink="/host/properties/new" class="btn btn-primary">Add your first room</a>
      </div>
    }
  `,
})
export class HostPropertiesComponent implements OnInit {
  private api = inject(ApiService);
  private dialog = inject(DialogService);
  private toast = inject(ToastService);

  list: Property[] = [];
  loading = true;
  error = '';
  img = imgUrl;

  ngOnInit() { this.load(); }

  load() {
    this.api.hostProperties().subscribe({
      next: l => { this.list = l; this.loading = false; this.error = ''; },
      error: e => { this.loading = false; this.error = errMsg(e); },
    });
  }

  async deactivate(p: Property) {
    const r = await this.dialog.ask({
      title: 'Deactivate this room?',
      message: 'It will be hidden from search. Existing bookings are not affected. You can activate it again anytime.',
      confirmText: 'Deactivate', danger: true,
    });
    if (!r.ok) return;
    try {
      await firstValueFrom(this.api.deactivateProperty(p.id));
      this.toast.success('Room deactivated');
      this.load();
    } catch (e) { this.toast.error(errMsg(e)); }
  }

  async activate(p: Property) {
    try {
      await firstValueFrom(this.api.updateProperty(p.id, toRequest(p, true)));
      this.toast.success('Room is active again');
      this.load();
    } catch (e) { this.toast.error(errMsg(e)); }
  }
}
