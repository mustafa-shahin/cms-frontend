import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

/**
 * A page header component with title, subtitle, and action buttons.
 */
@Component({
  selector: 'cms-page-header',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <div>
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white">{{ title }}</h1>
        @if (subtitle) {
          <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">{{ subtitle }}</p>
        }
      </div>
      <div class="flex items-center gap-2">
        <ng-content></ng-content>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }
  `]
})
export class PageHeaderComponent {
  /** Page title */
  @Input({ required: true }) title!: string;
  /** Optional subtitle/description */
  @Input() subtitle?: string;
}
