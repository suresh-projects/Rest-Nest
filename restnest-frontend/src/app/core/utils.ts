import { HttpErrorResponse } from '@angular/common/http';
import { API_URL } from './config';

export const pad = (n: number): string => String(n).padStart(2, '0');

export function toIsoDate(d: Date): string {
  return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());
}

export function addDays(d: Date, n: number): Date {
  const x = new Date(d);
  x.setDate(x.getDate() + n);
  return x;
}

/** "10:30" or "10:30:00" -> minutes from midnight */
export function toMin(t: string): number {
  const [h, m] = t.split(':');
  return Number(h) * 60 + Number(m);
}

export function minToHHmm(m: number): string {
  return pad(Math.floor(m / 60)) + ':' + pad(m % 60);
}

export function minToLabel(m: number): string {
  const h = Math.floor(m / 60);
  const mm = m % 60;
  const ap = h >= 12 ? 'PM' : 'AM';
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return h12 + ':' + pad(mm) + ' ' + ap;
}

export function imgUrl(url: string): string {
  return url.startsWith('http') ? url : API_URL + url;
}

export function errMsg(err: unknown, fallback = 'Something went wrong. Please try again.'): string {
  const e = err as HttpErrorResponse;
  if (e?.status === 0) {
    return 'Cannot reach the server. Check that the backend is running on ' + API_URL;
  }
  const body = e?.error;
  if (body && typeof body === 'object') {
    if (body.errors && typeof body.errors === 'object') {
      const vals = Object.values(body.errors as Record<string, string>);
      if (vals.length) return vals.join(' • ');
    }
    if (body.message) return String(body.message);
  }
  return fallback;
}

export function fieldErrors(err: unknown): Record<string, string> {
  const body = (err as HttpErrorResponse)?.error;
  return body && typeof body === 'object' && body.errors ? (body.errors as Record<string, string>) : {};
}
