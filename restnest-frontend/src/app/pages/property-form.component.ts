import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { ApiService } from '../core/api.service';
import { AMENITIES, CHENNAI_AREAS, HUBS, RULES } from '../core/labels';
import { Photo, PropertyRequest } from '../core/models';
import { ToastService } from '../core/toast.service';
import { errMsg, fieldErrors, imgUrl } from '../core/utils';

const MAX_PHOTOS = 8;
const OK_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

interface Pending { file: File; url: string; }

@Component({
  selector: 'app-property-form',
  imports: [FormsModule, RouterLink],
  template: `
    <a routerLink="/host/properties" class="back">← Back to my rooms</a>
    <h1>{{ id ? 'Edit room' : 'Add a room' }}</h1>

    @if (loading) {
      <div class="skeleton tall"></div>
    } @else {
      <div class="form-grid">
        <section class="card pad">
          <h3>Basic details</h3>
          <label class="field" [class.bad]="fe['title']">
            <span>Title</span>
            <input type="text" maxlength="150" placeholder="E.g. Cosy AC room near Egmore station" [(ngModel)]="m.title" />
            @if (fe['title']) { <small class="err-text">{{ fe['title'] }}</small> }
          </label>
          <label class="field">
            <span>Description</span>
            <textarea rows="4" maxlength="2000" placeholder="What can families expect? Clean bathroom, baby space, AC…" [(ngModel)]="m.description"></textarea>
          </label>
          <div class="two">
            <label class="field" [class.bad]="fe['area']">
              <span>Area</span>
              <input type="text" list="areas" placeholder="E.g. Egmore" [(ngModel)]="m.area" />
              <datalist id="areas">@for (a of areaOptions; track a) { <option [value]="a"></option> }</datalist>
              @if (fe['area']) { <small class="err-text">{{ fe['area'] }}</small> }
            </label>
            <label class="field">
              <span>Nearest station / bus stand</span>
              <select [(ngModel)]="m.nearestHub">
                @for (h of hubs; track h.code) { <option [value]="h.code">{{ h.label }}</option> }
              </select>
            </label>
          </div>
          <label class="field" [class.bad]="fe['address']">
            <span>Full address <small class="muted">(private, shared only after you confirm a booking)</small></span>
            <textarea rows="2" maxlength="500" [(ngModel)]="m.address"></textarea>
            @if (fe['address']) { <small class="err-text">{{ fe['address'] }}</small> }
          </label>
        </section>

        <section class="card pad">
          <h3>Price and timing</h3>
          <div class="two">
            <label class="field" [class.bad]="fe['pricePerHour']">
              <span>Price per hour (₹)</span>
              <input type="number" min="50" max="5000" [(ngModel)]="m.pricePerHour" />
              @if (fe['pricePerHour']) { <small class="err-text">{{ fe['pricePerHour'] }}</small> }
            </label>
            <label class="field" [class.bad]="fe['maxGuests']">
              <span>Max guests</span>
              <input type="number" min="1" max="20" [(ngModel)]="m.maxGuests" />
              @if (fe['maxGuests']) { <small class="err-text">{{ fe['maxGuests'] }}</small> }
            </label>
          </div>
          <div class="two">
            <label class="field" [class.bad]="fe['minHours']">
              <span>Minimum hours</span>
              <input type="number" min="1" max="6" [(ngModel)]="m.minHours" />
              @if (fe['minHours']) { <small class="err-text">{{ fe['minHours'] }}</small> }
            </label>
            <div></div>
          </div>
          <div class="two">
            <label class="field" [class.bad]="fe['time']">
              <span>Available from</span>
              <input type="time" [(ngModel)]="m.availableFrom" />
            </label>
            <label class="field" [class.bad]="fe['time']">
              <span>Available till</span>
              <input type="time" [(ngModel)]="m.availableTo" />
            </label>
          </div>
          @if (fe['time']) { <small class="err-text">{{ fe['time'] }}</small> }
          @if (id) {
            <label class="check">
              <input type="checkbox" [(ngModel)]="m.active" />
              <span>Room is active (visible in search)</span>
            </label>
          }
        </section>

        <section class="card pad">
          <h3>Amenities</h3>
          <div class="chips">
            @for (a of amenities; track a.code) {
              <button type="button" class="chip" [class.on]="selAmenities.has(a.code)" (click)="toggle(selAmenities, a.code)">
                {{ a.icon }} {{ a.label }}
              </button>
            }
          </div>
          <h3>House rules</h3>
          <div class="chips">
            @for (r of rules; track r.code) {
              <button type="button" class="chip" [class.on]="selRules.has(r.code)" (click)="toggle(selRules, r.code)">
                {{ r.icon }} {{ r.label }}
              </button>
            }
          </div>
        </section>

        <section class="card pad">
          <h3>Photos <small class="muted">(max {{ maxPhotos }}, JPG / PNG / WEBP, 5 MB each)</small></h3>
          <div class="photo-grid">
            @for (ph of photos; track ph.id) {
              <div class="photo">
                <img [src]="img(ph.url)" alt="" />
                <button type="button" class="x" aria-label="Delete photo" (click)="removePhoto(ph)">✕</button>
              </div>
            }
            @for (pp of pending; track pp.url; let i = $index) {
              <div class="photo">
                <img [src]="pp.url" alt="" />
                <button type="button" class="x" aria-label="Remove" (click)="removePending(i)">✕</button>
              </div>
            }
            @if (photos.length + pending.length < maxPhotos) {
              <label class="photo add">
                <span>＋</span><small>Add photos</small>
                <input type="file" accept="image/jpeg,image/png,image/webp" multiple hidden (change)="onFiles($event)" />
              </label>
            }
          </div>
          @if (!id && pending.length) { <small class="muted">Photos will be uploaded when you save the room.</small> }
        </section>
      </div>

      <div class="actions end sticky-actions">
        <a routerLink="/host/properties" class="btn btn-ghost">Cancel</a>
        <button type="button" class="btn btn-primary" [disabled]="saving" (click)="save()">
          {{ saving ? 'Saving…' : (id ? 'Save changes' : 'Create room') }}
        </button>
      </div>
    }
  `,
})
export class PropertyFormComponent implements OnInit {
  private api = inject(ApiService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private toast = inject(ToastService);

  id: number | null = null;
  loading = false;
  saving = false;
  maxPhotos = MAX_PHOTOS;
  img = imgUrl;

  hubs = HUBS;
  amenities = AMENITIES;
  rules = RULES;
  areaOptions: string[] = [...CHENNAI_AREAS];

  m = {
    title: '', description: '', area: '', address: '', nearestHub: 'NONE',
    pricePerHour: 400 as number | null, maxGuests: 4 as number | null, minHours: 1 as number | null,
    availableFrom: '06:00', availableTo: '22:00', active: true,
  };
  selAmenities = new Set<string>();
  selRules = new Set<string>(['NO_ALCOHOL', 'NO_SMOKING', 'FAMILY_ONLY']);
  photos: Photo[] = [];
  pending: Pending[] = [];
  fe: Record<string, string> = {};

  ngOnInit() {
    this.api.meta().subscribe({
      next: meta => (this.areaOptions = [...new Set([...meta.areas, ...CHENNAI_AREAS])]),
      error: () => {},
    });
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.id = Number(idParam);
      this.loading = true;
      this.api.hostProperty(this.id).subscribe({
        next: p => {
          this.m = {
            title: p.title, description: p.description ?? '', area: p.area, address: p.address ?? '',
            nearestHub: p.nearestHub, pricePerHour: p.pricePerHour, maxGuests: p.maxGuests, minHours: p.minHours,
            availableFrom: p.availableFrom.slice(0, 5), availableTo: p.availableTo.slice(0, 5), active: p.active,
          };
          this.selAmenities = new Set(p.amenities);
          this.selRules = new Set(p.houseRules);
          this.photos = p.photos;
          this.loading = false;
        },
        error: e => { this.toast.error(errMsg(e)); this.router.navigate(['/host/properties']); },
      });
    }
  }

  toggle(set: Set<string>, code: string) {
    if (set.has(code)) set.delete(code); else set.add(code);
  }

  onFiles(ev: Event) {
    const input = ev.target as HTMLInputElement;
    const files = Array.from(input.files ?? []);
    input.value = '';
    const room = MAX_PHOTOS - this.photos.length - this.pending.length;
    const good: File[] = [];
    for (const f of files) {
      if (!OK_TYPES.includes(f.type)) { this.toast.error(f.name + ': only JPG, PNG or WEBP allowed'); continue; }
      if (f.size > 5 * 1024 * 1024) { this.toast.error(f.name + ': larger than 5 MB'); continue; }
      good.push(f);
    }
    if (good.length > room) this.toast.error('You can add only ' + room + ' more photo(s)');
    const take = good.slice(0, Math.max(room, 0));
    if (!take.length) return;

    if (this.id) {
      this.upload(this.id, take);
    } else {
      this.pending.push(...take.map(file => ({ file, url: URL.createObjectURL(file) })));
    }
  }

  removePending(i: number) {
    URL.revokeObjectURL(this.pending[i].url);
    this.pending.splice(i, 1);
  }

  async removePhoto(ph: Photo) {
    if (!this.id) return;
    try {
      await firstValueFrom(this.api.deletePhoto(this.id, ph.id));
      this.photos = this.photos.filter(x => x.id !== ph.id);
      this.toast.success('Photo deleted');
    } catch (e) { this.toast.error(errMsg(e)); }
  }

  private async upload(id: number, files: File[]) {
    try {
      const p = await firstValueFrom(this.api.uploadPhotos(id, files));
      this.photos = p.photos;
      this.toast.success('Photo(s) uploaded');
    } catch (e) { this.toast.error(errMsg(e)); }
  }

  private validate(): boolean {
    const e: Record<string, string> = {};
    const price = Number(this.m.pricePerHour);
    const guests = Number(this.m.maxGuests);
    const minH = Number(this.m.minHours);
    if (!this.m.title.trim()) e['title'] = 'Title is required';
    if (!this.m.area.trim()) e['area'] = 'Area is required';
    if (!this.m.address.trim()) e['address'] = 'Address is required';
    if (!(price >= 50 && price <= 5000)) e['pricePerHour'] = 'Price must be between ₹50 and ₹5000 per hour';
    if (!(guests >= 1 && guests <= 20)) e['maxGuests'] = 'Max guests must be 1 to 20';
    if (!(minH >= 1 && minH <= 6)) e['minHours'] = 'Minimum hours must be 1 to 6';
    if (!this.m.availableFrom || !this.m.availableTo || this.m.availableFrom >= this.m.availableTo) {
      e['time'] = 'Closing time must be after opening time';
    }
    this.fe = e;
    return Object.keys(e).length === 0;
  }

  async save() {
    if (!this.validate()) { this.toast.error('Please fix the highlighted fields'); return; }
    const req: PropertyRequest = {
      title: this.m.title.trim(), description: this.m.description.trim(), area: this.m.area.trim(),
      address: this.m.address.trim(), nearestHub: this.m.nearestHub,
      pricePerHour: Number(this.m.pricePerHour), maxGuests: Number(this.m.maxGuests), minHours: Number(this.m.minHours),
      availableFrom: this.m.availableFrom, availableTo: this.m.availableTo,
      amenities: [...this.selAmenities], houseRules: [...this.selRules],
      active: this.id ? this.m.active : undefined,
    };
    this.saving = true;
    try {
      if (this.id) {
        await firstValueFrom(this.api.updateProperty(this.id, req));
        this.toast.success('Room updated');
      } else {
        const created = await firstValueFrom(this.api.createProperty(req));
        if (this.pending.length) {
          try { await firstValueFrom(this.api.uploadPhotos(created.id, this.pending.map(p => p.file))); }
          catch (e) { this.toast.error('Room created, but photo upload failed: ' + errMsg(e)); }
        }
        this.toast.success('Room created');
      }
      this.router.navigate(['/host/properties']);
    } catch (e) {
      this.saving = false;
      this.fe = fieldErrors(e);
      this.toast.error(errMsg(e));
    }
  }
}
