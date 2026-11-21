import { CurrencyPipe } from '@angular/common';
import { Component, Input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LabelPipe } from '../core/pipes';
import { Property } from '../core/models';
import { imgUrl } from '../core/utils';

@Component({
  selector: 'app-property-card',
  imports: [RouterLink, CurrencyPipe, LabelPipe],
  template: `
    <a class="card prop-card" [routerLink]="['/property', p.id]">
      <div class="thumb">
        @if (p.photos.length) {
          <img [src]="img(p.photos[0].url)" [alt]="p.title" loading="lazy" />
        } @else {
          <div class="ph">🏠</div>
        }
        <span class="price">{{ p.pricePerHour | currency: 'INR' : 'symbol' : '1.0-0' }}<small>/hr</small></span>
        @if (!p.active) { <span class="tag-off">Inactive</span> }
      </div>
      <div class="body">
        <h3>{{ p.title }}</h3>
        <p class="muted">📍 {{ p.area }}@if (p.nearestHub !== 'NONE') { · near {{ p.nearestHub | label: 'hub' }} }</p>
        <div class="chips">
          @for (r of p.houseRules.slice(0, 3); track r) {
            <span class="chip sm">{{ r | label: 'rule' }}</span>
          }
        </div>
        <p class="meta">👨‍👩‍👧 Up to {{ p.maxGuests }} guests · min {{ p.minHours }} hr</p>
      </div>
    </a>
  `,
})
export class PropertyCardComponent {
  @Input({ required: true }) p!: Property;
  img = imgUrl;
}
