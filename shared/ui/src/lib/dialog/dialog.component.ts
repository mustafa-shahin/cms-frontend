import { Component, EventEmitter, Input, Output } from '@angular/core';

import { CommonModule } from '@angular/common';
import { IconComponent } from '../icon/icon.component';

@Component({
  selector: 'cms-dialog',
  standalone: true,
  imports: [CommonModule, IconComponent],
  templateUrl: './dialog.component.html',
})
export class DialogComponent {
  @Input() isOpen = false;
  @Input() title = '';
  @Input() closeOnBackdrop = true;
  @Input() size: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full' = 'md';
  @Output() dismiss = new EventEmitter<void>();

  get maxWidthClass(): string {
    switch (this.size) {
      case 'sm': return 'sm:max-w-sm';
      case 'md': return 'sm:max-w-lg';
      case 'lg': return 'sm:max-w-2xl';
      case 'xl': return 'sm:max-w-4xl';
      case '2xl': return 'sm:max-w-6xl';
      case 'full': return 'sm:max-w-full sm:m-4';
      default: return 'sm:max-w-lg';
    }
  }
}
