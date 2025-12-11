import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { IconComponent } from '../icon/icon.component';

/**
 * A loading spinner component.
 */
@Component({
  selector: 'cms-loading-spinner',
  standalone: true,
  imports: [CommonModule, IconComponent],
  template: `
    @if (overlay) {
      <div class="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div class="bg-white dark:bg-gray-800 rounded-lg p-6 flex flex-col items-center gap-3">
          <cms-icon name="spinner" class="animate-spin text-primary-500" [size]="size"></cms-icon>
          @if (message) {
            <span class="text-gray-700 dark:text-gray-300 text-sm">{{ message }}</span>
          }
        </div>
      </div>
    } @else {
      <div class="flex items-center justify-center gap-2" [class]="containerClasses">
        <cms-icon name="spinner" class="animate-spin text-primary-500" [size]="size"></cms-icon>
        @if (message) {
          <span class="text-gray-500 dark:text-gray-400">{{ message }}</span>
        }
      </div>
    }
  `,
  styles: [`
    :host {
      display: block;
    }
  `]
})
export class LoadingSpinnerComponent {
  /** Optional loading message */
  @Input() message?: string;
  /** Spinner size */
  @Input() size: 'sm' | 'md' | 'lg' | '2xl' = 'md';
  /** Full overlay mode */
  @Input() overlay = false;

  get containerClasses(): string {
    return this.size === 'lg' || this.size === '2xl' ? 'py-12' : 'py-8';
  }
}
