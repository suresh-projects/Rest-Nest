import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { API_URL } from './config';
import {
  Availability, Booking, BookingRequest, Meta, PageResponse, Property, PropertyRequest, SearchParams,
} from './models';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private http = inject(HttpClient);
  private u(path: string): string { return API_URL + path; }

  // ---- public ----
  meta() { return this.http.get<Meta>(this.u('/api/meta')); }

  search(s: SearchParams) {
    let params = new HttpParams();
    const add = (k: string, v: unknown) => {
      if (v !== null && v !== undefined && v !== '') params = params.set(k, String(v));
    };
    add('q', s.q); add('area', s.area); add('hub', s.hub);
    add('minPrice', s.minPrice); add('maxPrice', s.maxPrice); add('guests', s.guests);
    add('sort', s.sort); add('page', s.page); add('size', s.size);
    s.amenities.forEach(a => params = params.append('amenities', a));
    s.rules.forEach(r => params = params.append('rules', r));
    return this.http.get<PageResponse<Property>>(this.u('/api/properties'), { params });
  }

  property(id: number) { return this.http.get<Property>(this.u('/api/properties/' + id)); }

  availability(id: number, date: string) {
    return this.http.get<Availability>(this.u('/api/properties/' + id + '/availability'), { params: { date } });
  }

  // ---- guest bookings ----
  createBooking(req: BookingRequest) { return this.http.post<Booking>(this.u('/api/bookings'), req); }
  myBookings() { return this.http.get<Booking[]>(this.u('/api/bookings')); }
  guestCancel(id: number, reason: string) {
    return this.http.post<Booking>(this.u('/api/bookings/' + id + '/cancel'), { reason: reason || null });
  }

  // ---- host properties ----
  hostProperties() { return this.http.get<Property[]>(this.u('/api/host/properties')); }
  hostProperty(id: number) { return this.http.get<Property>(this.u('/api/host/properties/' + id)); }
  createProperty(req: PropertyRequest) { return this.http.post<Property>(this.u('/api/host/properties'), req); }
  updateProperty(id: number, req: PropertyRequest) {
    return this.http.put<Property>(this.u('/api/host/properties/' + id), req);
  }
  deactivateProperty(id: number) { return this.http.delete<void>(this.u('/api/host/properties/' + id)); }
  uploadPhotos(id: number, files: File[]) {
    const fd = new FormData();
    files.forEach(f => fd.append('files', f, f.name));
    return this.http.post<Property>(this.u('/api/host/properties/' + id + '/photos'), fd);
  }
  deletePhoto(propertyId: number, photoId: number) {
    return this.http.delete<void>(this.u('/api/host/properties/' + propertyId + '/photos/' + photoId));
  }

  // ---- host bookings ----
  hostBookings(status?: string) {
    const params = status ? new HttpParams().set('status', status) : new HttpParams();
    return this.http.get<Booking[]>(this.u('/api/host/bookings'), { params });
  }
  hostConfirm(id: number) { return this.http.post<Booking>(this.u('/api/host/bookings/' + id + '/confirm'), {}); }
  hostReject(id: number, reason: string) {
    return this.http.post<Booking>(this.u('/api/host/bookings/' + id + '/reject'), { reason: reason || null });
  }
  hostCancel(id: number, reason: string) {
    return this.http.post<Booking>(this.u('/api/host/bookings/' + id + '/cancel'), { reason: reason || null });
  }
}
