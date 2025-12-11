import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { IconComponent } from '../icon/icon.component';

/** Color variants for the badge */
export type CmsBadgeColor = 'success' | 'error' | 'warning' | 'info' | 'purple' | 'blue' | 'gray';

/**
 * A status badge component with color variants.
 */
@Component({
  selector: 'cms-badge',
  standalone: true,
  imports: [CommonModule, IconComponent],
  template: `
    <span [class]="badgeClasses">
      @if (iconName) {
        <cms-icon [name]="iconName" size="xs"></cms-icon>
      }
      {{ text }}
    </span>
  `,
  styles: [`
    :host {
      display: inline-block;
    }
  `]
})
export class BadgeComponent {
  /** Text to display on the badge (required) */
  @Input({ required: true }) text!: string;
  /** Color variant */
  @Input() color: CmsBadgeColor = 'gray';
  /** Optional icon name */
  @Input() iconName?: string;
  /** Size of the badge */
  @Input() size: 'sm' | 'md' = 'md';

  get badgeClasses(): string {
    const base = 'inline-flex items-center gap-1 font-medium rounded-full';
    
    const sizes: Record<string, string> = {
      sm: 'px-2 py-0.5 text-xs',
      md: 'px-2.5 py-0.5 text-xs'
    };

    const colors: Record<CmsBadgeColor, string> = {
      success: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
      error: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
      warning: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
      info: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
      purple: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
      blue: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
      gray: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
    };

    return `${base} ${sizes[this.size]} ${colors[this.color]}`;
  }
}
