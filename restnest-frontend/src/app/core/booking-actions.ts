import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { ApiService } from './api.service';
import { DialogService } from './dialog.service';
import { Booking } from './models';
import { ToastService } from './toast.service';
import { errMsg } from './utils';

/** Guest + host booking actions (dialog -> API -> toast). Return true if something changed. */
@Injectable({ providedIn: 'root' })
export class BookingActions {
  private api = inject(ApiService);
  private dialog = inject(DialogService);
  private toast = inject(ToastService);

  async guestCancel(b: Booking): Promise<boolean> {
    const r = await this.dialog.ask({
      title: 'Cancel this booking?',
      message: b.status === 'CONFIRMED'
        ? 'Confirmed bookings can be cancelled up to 2 hours before the start time.'
        : 'The host has not confirmed yet. Cancelling will free the slot.',
      confirmText: 'Yes, cancel booking', danger: true, withReason: true,
    });
    if (!r.ok) return false;
    return this.run(() => this.api.guestCancel(b.id, r.reason), 'Booking cancelled');
  }

  async hostConfirm(b: Booking): Promise<boolean> {
    const r = await this.dialog.ask({
      title: 'Confirm this booking?',
      message: 'Your full address and phone number will be shared with ' + b.guestName + '.',
      confirmText: 'Confirm booking',
    });
    if (!r.ok) return false;
    return this.run(() => this.api.hostConfirm(b.id), 'Booking confirmed');
  }

  async hostReject(b: Booking): Promise<boolean> {
    const r = await this.dialog.ask({
      title: 'Reject this request?', confirmText: 'Reject', danger: true, withReason: true,
    });
    if (!r.ok) return false;
    return this.run(() => this.api.hostReject(b.id, r.reason), 'Request rejected');
  }

  async hostCancel(b: Booking): Promise<boolean> {
    const r = await this.dialog.ask({
      title: 'Cancel this confirmed booking?',
      message: 'The guest will see the cancellation.',
      confirmText: 'Cancel booking', danger: true, withReason: true,
    });
    if (!r.ok) return false;
    return this.run(() => this.api.hostCancel(b.id, r.reason), 'Booking cancelled');
  }

  private async run(call: () => import('rxjs').Observable<unknown>, okMsg: string): Promise<boolean> {
    try {
      await firstValueFrom(call());
      this.toast.success(okMsg);
      return true;
    } catch (e) {
      this.toast.error(errMsg(e));
      return true; // refresh list anyway (state may have changed)
    }
  }
}
