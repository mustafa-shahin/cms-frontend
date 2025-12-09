import { Component, inject } from '@angular/core';

import { ToasterService, Toast } from './toaster.service';
import { IconComponent } from '../icon/icon.component';

@Component({
  selector: 'cms-toaster',
  standalone: true,
  imports: [IconComponent],
  templateUrl: './toaster.component.html',
  styles: [`
    :host {
      display: block;
    }

    @keyframes slideIn {
      from {
        transform: translateX(100%);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }

    @keyframes slideOut {
      from {
        transform: translateX(0);
        opacity: 1;
      }
      to {
        transform: translateX(100%);
        opacity: 0;
      }
    }

    .toast-enter {
      animation: slideIn 0.3s ease-out;
    }

    .toast-exit {
      animation: slideOut 0.2s ease-in;
    }
  `]
})
export class ToasterComponent {
  private readonly toasterService = inject(ToasterService);

  readonly toasts = this.toasterService.toasts$;

  /**
   * Remove a toast
   */
  remove(id: string): void {
    this.toasterService.remove(id);
  }

  /**
   * Get icon name for toast type
   */
  getIcon(type: string): string {
    switch (type) {
      case 'success': return 'check-circle';
      case 'error': return 'times-circle';
      case 'warning': return 'exclamation-triangle';
      case 'info': return 'info-circle';
      default: return 'info-circle';
    }
  }

  /**
   * Get CSS classes for toast type
   */
  getClasses(type: string): string {
    const baseClasses = 'toast-enter flex items-start gap-3 rounded-lg p-4 shadow-lg border backdrop-blur-sm';

    switch (type) {
      case 'success':
        return `${baseClasses} bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-700 text-green-800 dark:text-green-200`;
      case 'error':
        return `${baseClasses} bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-700 text-red-800 dark:text-red-200`;
      case 'warning':
        return `${baseClasses} bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-700 text-yellow-800 dark:text-yellow-200`;
      case 'info':
        return `${baseClasses} bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-700 text-blue-800 dark:text-blue-200`;
      default:
        return `${baseClasses} bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-200`;
    }
  }

  /**
   * Get icon color class for toast type
   */
  getIconColorClass(type: string): string {
    switch (type) {
      case 'success': return 'text-green-600 dark:text-green-400';
      case 'error': return 'text-red-600 dark:text-red-400';
      case 'warning': return 'text-yellow-600 dark:text-yellow-400';
      case 'info': return 'text-blue-600 dark:text-blue-400';
      default: return 'text-gray-600 dark:text-gray-400';
    }
  }
}
