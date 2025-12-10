import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { IconComponent } from '../icon/icon.component';

/** Color variants for the button */
export type CmsButtonColor = 'primary' | 'secondary' | 'danger' | 'success' | 'ghost' | 'warning' | 'link';

/** Icon-only button variants */
export type CmsIconOnlyVariant = 'solid' | 'outline' | 'ghost';

/** Interface for the pressed event */
export interface CmsButtonPressedEvent {
  event: MouseEvent;
}

/**
 * A reusable button component with consistent styling.
 * Supports icons, loading state, and multiple color variants.
 */
@Component({
  selector: 'cms-button',
  standalone: true,
  imports: [CommonModule, IconComponent],
  template: `
    <button
      [type]="type"
      [disabled]="disabled || loading"
      (click)="onClick($event)"
      [class]="buttonClasses"
      [title]="title || ''"
    >
      @if (loading) {
        <cms-icon name="spinner" class="animate-spin" [size]="iconSize"></cms-icon>
      } @else if (iconName) {
        <cms-icon [name]="iconName" [size]="iconSize"></cms-icon>
      }
      @if (label && !iconOnly) {
        <span>{{ label }}</span>
      }
      <ng-content></ng-content>
    </button>
  `,
  styles: [`
    :host {
      display: inline-block;
    }
  `]
})
export class ButtonComponent {
  /** The label/text on the button */
  @Input() label?: string;
  /** The color variant of the button */
  @Input() color: CmsButtonColor = 'primary';
  /** The icon name to display */
  @Input() iconName?: string;
  /** Whether the button is disabled */
  @Input() disabled = false;
  /** The size of the button */
  @Input() size: 'xs' | 'sm' | 'md' | 'lg' = 'md';
  /** Whether the button is in loading state */
  @Input() loading = false;
  /** Whether button takes full width */
  @Input() fullWidth = false;
  /** Icon-only mode (circular/square button) */
  @Input() iconOnly = false;
  /** Icon-only variant: solid (with bg), outline (border), ghost (no bg) */
  @Input() iconOnlyVariant: CmsIconOnlyVariant = 'solid';
  /** Button type attribute */
  @Input() type: 'button' | 'submit' | 'reset' = 'button';
  /** Tooltip title */
  @Input() title?: string;
  /** Additional custom CSS classes */
  @Input() customClass?: string;
  /** Event emitted when button is pressed */
  @Output() pressed = new EventEmitter<CmsButtonPressedEvent>();

  get iconSize(): 'xs' | 'sm' | 'md' | 'lg' {
    if (this.iconOnly) {
      return this.size === 'lg' ? 'md' : this.size === 'xs' ? 'xs' : 'sm';
    }
    return this.size === 'lg' ? 'md' : this.size === 'sm' ? 'xs' : 'sm';
  }

  get buttonClasses(): string {
    const base = 'inline-flex items-center justify-center font-medium transition-colors focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed';
    
    // Icon-only sizing
    if (this.iconOnly) {
      const iconSizes: Record<string, string> = {
        xs: 'p-1 rounded',
        sm: 'p-1.5 rounded-lg',
        md: 'p-2 rounded-lg',
        lg: 'p-3 rounded-lg'
      };
      const colorClasses = this.getIconOnlyColorClasses();
      return `${base} ${iconSizes[this.size]} ${colorClasses} ${this.customClass || ''}`.trim();
    }

    const sizes: Record<string, string> = {
      xs: 'px-2 py-1 text-xs gap-1 rounded',
      sm: 'px-3 py-1.5 text-sm gap-1.5 rounded-lg',
      md: 'px-4 py-2 text-sm gap-2 rounded-lg',
      lg: 'px-6 py-3 text-base gap-2 rounded-lg'
    };

    const width = this.fullWidth ? 'w-full' : '';

    return `${base} ${sizes[this.size]} ${this.getColorClasses()} ${width} ${this.customClass || ''}`.trim();
  }

  private getColorClasses(): string {
    const colors: Record<CmsButtonColor, string> = {
      primary: 'bg-primary-600 hover:bg-primary-700 text-white focus:ring-2 focus:ring-primary-500',
      secondary: 'bg-gray-100 hover:bg-gray-200 text-gray-900 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-white focus:ring-2 focus:ring-gray-500',
      danger: 'bg-red-600 hover:bg-red-700 text-white focus:ring-2 focus:ring-red-500',
      success: 'bg-green-600 hover:bg-green-700 text-white focus:ring-2 focus:ring-green-500',
      warning: 'bg-orange-600 hover:bg-orange-700 text-white focus:ring-2 focus:ring-orange-500',
      ghost: 'bg-transparent hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300',
      link: 'bg-transparent text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300'
    };
    return colors[this.color];
  }

  private getIconOnlyColorClasses(): string {
    // Ghost variant - no background, just icon color
    if (this.iconOnlyVariant === 'ghost') {
      const ghostColors: Record<CmsButtonColor, string> = {
        primary: 'text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300',
        secondary: 'text-gray-600 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300',
        danger: 'text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300',
        success: 'text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300',
        warning: 'text-orange-600 hover:text-orange-700 dark:text-orange-400 dark:hover:text-orange-300',
        ghost: 'text-gray-600 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300',
        link: 'text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300'
      };
      return ghostColors[this.color];
    }

    // Outline variant - border, transparent bg, colored text
    if (this.iconOnlyVariant === 'outline') {
      const outlineColors: Record<CmsButtonColor, string> = {
        primary: 'border border-primary-600 text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/20',
        secondary: 'border border-gray-300 text-gray-600 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-400 dark:hover:bg-gray-700',
        danger: 'border border-red-600 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20',
        success: 'border border-green-600 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20',
        warning: 'border border-orange-600 text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-900/20',
        ghost: 'border border-gray-300 text-gray-600 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-400 dark:hover:bg-gray-700',
        link: 'border border-primary-600 text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/20'
      };
      return outlineColors[this.color];
    }

    // Solid variant (default) - full background color
    return this.getColorClasses();
  }

  onClick(event: MouseEvent): void {
    if (this.disabled || this.loading) return;
    this.pressed.emit({ event });
  }
}


