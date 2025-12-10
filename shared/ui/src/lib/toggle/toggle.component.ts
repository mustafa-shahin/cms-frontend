import { CommonModule } from '@angular/common';
import { Component, forwardRef, Input } from '@angular/core';
import { ControlValueAccessor, FormControl, NG_VALUE_ACCESSOR, ReactiveFormsModule } from '@angular/forms';

/**
 * A toggle switch component for boolean settings.
 */
@Component({
  selector: 'cms-toggle',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="inline-flex items-center gap-3 cursor-pointer" [class.opacity-50]="disabled" [class.cursor-not-allowed]="disabled">
      <button
        type="button"
        role="switch"
        [attr.aria-checked]="formCtrl.value"
        [attr.aria-label]="label || 'Toggle'"
        (click)="toggle()"
        [disabled]="disabled"
        class="relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
        [class.bg-primary-600]="formCtrl.value"
        [class.bg-gray-200]="!formCtrl.value"
        [class.dark:bg-gray-600]="!formCtrl.value"
        [class.cursor-not-allowed]="disabled"
      >
        <span
          class="pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out"
          [class.translate-x-5]="formCtrl.value"
          [class.translate-x-0]="!formCtrl.value"
        ></span>
      </button>
      @if (label || description) {
        <div class="flex flex-col" (click)="toggle()" (keydown.enter)="toggle()" (keydown.space)="toggle(); $event.preventDefault()" tabindex="0" role="button">
          @if (label) {
            <span class="text-sm font-medium text-gray-900 dark:text-white select-none">{{ label }}</span>
          }
          @if (description) {
            <span class="text-xs text-gray-500 dark:text-gray-400 select-none">{{ description }}</span>
          }
        </div>
      }
    </div>
  `,
  styles: [`
    :host {
      display: inline-block;
    }
  `],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      multi: true,
      useExisting: forwardRef(() => ToggleComponent),
    },
  ]
})
export class ToggleComponent implements ControlValueAccessor {
  /** Toggle label */
  @Input() label?: string;
  /** Supporting description */
  @Input() description?: string;
  /** Disabled state */
  @Input() disabled = false;

  formCtrl = new FormControl(false);

  toggle(): void {
    if (!this.disabled) {
      this.formCtrl.setValue(!this.formCtrl.value);
    }
  }

  writeValue(val: boolean): void {
    this.formCtrl.setValue(val, { emitEvent: false });
  }

  registerOnChange(fn: (val: boolean | null) => void): void {
    this.formCtrl.valueChanges.subscribe(fn);
  }

  registerOnTouched(_fn: () => void): void {
    // Not needed
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
    if (isDisabled) {
      this.formCtrl.disable({ emitEvent: false });
    } else {
      this.formCtrl.enable({ emitEvent: false });
    }
  }
}
