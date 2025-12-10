import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { IconComponent } from '../icon/icon.component';

/**
 * An empty state component for when there's no data.
 */
@Component({
  selector: 'cms-empty-state',
  standalone: true,
  imports: [CommonModule, IconComponent],
  template: `
    <div class="text-center py-12">
      @if (iconName) {
        <cms-icon 
          [name]="iconName" 
          class="text-gray-300 dark:text-gray-600 mx-auto mb-4" 
          size="2xl"
        ></cms-icon>
      }
      <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-2">{{ title }}</h3>
      @if (description) {
        <p class="text-gray-500 dark:text-gray-400 mb-4">{{ description }}</p>
      }
      <div class="flex justify-center">
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
export class EmptyStateComponent {
  /** Icon name to display */
  @Input() iconName?: string;
  /** Main message */
  @Input({ required: true }) title!: string;
  /** Supporting description */
  @Input() description?: string;
}
