import { Injectable, signal } from '@angular/core';

export interface Toast { id: number; text: string; type: 'ok' | 'err'; }

@Injectable({ providedIn: 'root' })
export class ToastService {
  readonly toasts = signal<Toast[]>([]);
  private seq = 0;

  success(text: string) { this.push(text, 'ok'); }
  error(text: string) { this.push(text, 'err'); }

  dismiss(id: number) {
    this.toasts.update(l => l.filter(t => t.id !== id));
  }

  private push(text: string, type: 'ok' | 'err') {
    const id = ++this.seq;
    this.toasts.update(l => [...l, { id, text, type }]);
    setTimeout(() => this.dismiss(id), type === 'err' ? 6000 : 3500);
  }
}
