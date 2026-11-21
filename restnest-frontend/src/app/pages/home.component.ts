import { Component, DestroyRef, OnInit, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { Subject, catchError, debounceTime, of, switchMap, tap } from 'rxjs';
import { ApiService } from '../core/api.service';
import { AMENITIES, HUBS, RULES } from '../core/labels';
import { PageResponse, Property, SearchParams } from '../core/models';
import { errMsg } from '../core/utils';
import { PropertyCardComponent } from '../shared/property-card.component';

@Component({
  selector: 'app-home',
  imports: [FormsModule, PropertyCardComponent],
  template: `
    <section class="hero">
      <h1>Rest a while, travel on.</h1>
      <p>Hourly home rooms for families in Chennai. Fresh up, feed the baby, rest, and carry on, from <strong>₹300/hour</strong>.</p>
      <div class="hero-search">
        <input type="search" placeholder="Search by area, e.g. Egmore, Koyambedu" [ngModel]="f.q"
               (ngModelChange)="f.q = $event; changed()" />
        <button type="button" class="btn btn-ghost filter-toggle" (click)="showFilters = !showFilters">
          ⚙️ Filters
        </button>
      </div>
    </section>

    <div class="layout">
      <aside class="filters card" [class.show]="showFilters">
        <div class="row between">
          <h3>Filters</h3>
          <button type="button" class="link" (click)="reset()">Reset</button>
        </div>

        <label class="field">
          <span>Area</span>
          <select [ngModel]="f.area" (ngModelChange)="f.area = $event; changed()">
            <option value="">All areas</option>
            @for (a of areas; track a) { <option [value]="a">{{ a }}</option> }
          </select>
        </label>

        <label class="field">
          <span>Near station / bus stand</span>
          <select [ngModel]="f.hub" (ngModelChange)="f.hub = $event; changed()">
            <option value="">Anywhere</option>
            @for (h of hubs; track h.code) {
              @if (h.code !== 'NONE') { <option [value]="h.code">{{ h.label }}</option> }
            }
          </select>
        </label>

        <div class="two">
          <label class="field">
            <span>Min ₹/hr</span>
            <input type="number" min="0" [ngModel]="f.minPrice" (ngModelChange)="f.minPrice = $event; changed()" />
          </label>
          <label class="field">
            <span>Max ₹/hr</span>
            <input type="number" min="0" [ngModel]="f.maxPrice" (ngModelChange)="f.maxPrice = $event; changed()" />
          </label>
        </div>

        <label class="field">
          <span>Guests</span>
          <input type="number" min="1" max="20" placeholder="Number of people" [ngModel]="f.guests"
                 (ngModelChange)="f.guests = $event; changed()" />
        </label>

        <div class="field">
          <span>Amenities</span>
          <div class="chips">
            @for (a of amenities; track a.code) {
              <button type="button" class="chip" [class.on]="selAmenities.has(a.code)" (click)="toggle(selAmenities, a.code)">
                {{ a.icon }} {{ a.label }}
              </button>
            }
          </div>
        </div>

        <div class="field">
          <span>House rules</span>
          <div class="chips">
            @for (r of rules; track r.code) {
              <button type="button" class="chip" [class.on]="selRules.has(r.code)" (click)="toggle(selRules, r.code)">
                {{ r.icon }} {{ r.label }}
              </button>
            }
          </div>
        </div>
      </aside>

      <section class="results">
        <div class="row between wrap">
          <p class="muted">
            @if (loading) { Searching… }
            @else if (result) { {{ result.totalElements }} room{{ result.totalElements === 1 ? '' : 's' }} found }
          </p>
          <label class="sort">
            Sort by
            <select [ngModel]="f.sort" (ngModelChange)="f.sort = $event; changed()">
              <option value="newest">Newest</option>
              <option value="price_asc">Price: low to high</option>
              <option value="price_desc">Price: high to low</option>
            </select>
          </label>
        </div>

        @if (error) { <div class="alert err">{{ error }}</div> }

        @if (result && result.content.length) {
          <div class="grid" [class.dim]="loading">
            @for (p of result.content; track p.id) { <app-property-card [p]="p" /> }
          </div>
          @if (result.totalPages > 1) {
            <div class="pager">
              <button type="button" class="btn btn-ghost btn-sm" [disabled]="page === 0" (click)="go(page - 1)">← Prev</button>
              <span>Page {{ page + 1 }} of {{ result.totalPages }}</span>
              <button type="button" class="btn btn-ghost btn-sm" [disabled]="page + 1 >= result.totalPages" (click)="go(page + 1)">Next →</button>
            </div>
          }
        } @else if (result && !loading) {
          <div class="empty">
            <div class="big">🔎</div>
            <h3>No rooms match these filters</h3>
            <p class="muted">Try a different area or remove some filters.</p>
            <button type="button" class="btn btn-primary" (click)="reset()">Reset filters</button>
          </div>
        }
      </section>
    </div>
  `,
})
export class HomeComponent implements OnInit {
  private api = inject(ApiService);
  private destroyRef = inject(DestroyRef);

  areas: string[] = [];
  hubs = HUBS;
  amenities = AMENITIES;
  rules = RULES;

  f = { q: '', area: '', hub: '', minPrice: null as number | null, maxPrice: null as number | null,
        guests: null as number | null, sort: 'newest' };
  selAmenities = new Set<string>();
  selRules = new Set<string>();

  page = 0;
  size = 9;
  result: PageResponse<Property> | null = null;
  loading = false;
  error = '';
  showFilters = false;

  private trigger = new Subject<void>();

  ngOnInit() {
    this.api.meta().subscribe({ next: m => (this.areas = m.areas), error: () => {} });

    this.trigger.pipe(
      debounceTime(250),
      tap(() => { this.loading = true; }),
      switchMap(() => this.api.search(this.params()).pipe(
        catchError(e => { this.error = errMsg(e); return of(null); })
      )),
      takeUntilDestroyed(this.destroyRef),
    ).subscribe(r => {
      this.loading = false;
      if (r) { this.result = r; this.error = ''; }
    });

    this.trigger.next();
  }

  changed() {
    this.page = 0;
    this.trigger.next();
  }

  toggle(set: Set<string>, code: string) {
    if (set.has(code)) set.delete(code); else set.add(code);
    this.changed();
  }

  go(p: number) {
    this.page = p;
    this.trigger.next();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  reset() {
    this.f = { q: '', area: '', hub: '', minPrice: null, maxPrice: null, guests: null, sort: 'newest' };
    this.selAmenities.clear();
    this.selRules.clear();
    this.changed();
  }

  private params(): SearchParams {
    return {
      q: this.f.q.trim(), area: this.f.area, hub: this.f.hub,
      minPrice: this.f.minPrice, maxPrice: this.f.maxPrice, guests: this.f.guests,
      amenities: [...this.selAmenities], rules: [...this.selRules],
      sort: this.f.sort, page: this.page, size: this.size,
    };
  }
}
