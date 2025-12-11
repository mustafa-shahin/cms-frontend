import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

/** Padding sizes for the card */
export type CmsCardPadding = 'none' | 'sm' | 'md' | 'lg';

/** Variant styles for the card */
export type CmsCardVariant = 'default' | 'elevated' | 'bordered';

/**
 * A card container component with consistent styling.
 */
@Component({
  selector: 'cms-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div [class]="cardClasses">
      <ng-content></ng-content>
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }
  `]
})
export class CardComponent {
  /** Padding size */
  @Input() padding: CmsCardPadding = 'md';
  /** Style variant */
  @Input() variant: CmsCardVariant = 'bordered';
  /** Enable hover effect */
  @Input() hoverable = false;

  get cardClasses(): string {
    const base = 'bg-white dark:bg-gray-800 rounded-lg';
    
    const paddings: Record<CmsCardPadding, string> = {
      none: '',
      sm: 'p-3',
      md: 'p-4',
      lg: 'p-6'
    };

    const variants: Record<CmsCardVariant, string> = {
      default: '',
      elevated: 'shadow-lg',
      bordered: 'border border-gray-200 dark:border-gray-700 shadow-sm'
    };

    const hover = this.hoverable ? 'hover:shadow-md transition-shadow cursor-pointer' : '';

    return `${base} ${paddings[this.padding]} ${variants[this.variant]} ${hover}`;
  }
}
