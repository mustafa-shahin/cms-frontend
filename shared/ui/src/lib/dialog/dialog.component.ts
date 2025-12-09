import { Component, EventEmitter, Input, Output } from '@angular/core';

import { IconComponent } from '../icon/icon.component';

@Component({
  selector: 'cms-dialog',
  standalone: true,
  imports: [IconComponent],
  templateUrl: './dialog.component.html',
})
export class DialogComponent {
  @Input() isOpen = false;
  @Input() title = '';
  @Input() closeOnBackdrop = true;
  @Output() dismiss = new EventEmitter<void>();
}
