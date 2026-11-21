import { Injectable, signal } from '@angular/core';

export interface DialogResult { ok: boolean; reason: string; }

export interface DialogOptions {
  title: string;
  message?: string;
  confirmText?: string;
  danger?: boolean;
  withReason?: boolean;
}

export interface DialogState extends DialogOptions {
  resolve: (r: DialogResult) => void;
}

@Injectable({ providedIn: 'root' })
export class DialogService {
  readonly state = signal<DialogState | null>(null);

  ask(opts: DialogOptions): Promise<DialogResult> {
    return new Promise(resolve => this.state.set({ ...opts, resolve }));
  }

  close(r: DialogResult) {
    const s = this.state();
    this.state.set(null);
    s?.resolve(r);
  }
}
