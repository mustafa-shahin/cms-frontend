import { Injectable, signal } from '@angular/core';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
  id: string;
  type: ToastType;
  message: string;
  duration?: number;
}

@Injectable({
  providedIn: 'root'
})
export class ToasterService {
  private toasts = signal<Toast[]>([]);

  readonly toasts$ = this.toasts.asReadonly();

  /**
   * Show a success toast
   */
  success(message: string, duration = 5000): void {
    this.show('success', message, duration);
  }

  /**
   * Show an error toast
   */
  error(message: string, duration = 7000): void {
    this.show('error', message, duration);
  }

  /**
   * Show a warning toast
   */
  warning(message: string, duration = 6000): void {
    this.show('warning', message, duration);
  }

  /**
   * Show an info toast
   */
  info(message: string, duration = 5000): void {
    this.show('info', message, duration);
  }

  /**
   * Show a toast with custom type
   */
  show(type: ToastType, message: string, duration = 5000): void {
    const id = this.generateId();
    const toast: Toast = { id, type, message, duration };

    this.toasts.update(toasts => [...toasts, toast]);

    if (duration > 0) {
      setTimeout(() => this.remove(id), duration);
    }
  }

  /**
   * Remove a toast by ID
   */
  remove(id: string): void {
    this.toasts.update(toasts => toasts.filter(t => t.id !== id));
  }

  /**
   * Remove all toasts
   */
  clear(): void {
    this.toasts.set([]);
  }

  private generateId(): string {
    return `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}
