import { CommonModule } from '@angular/common';
import { Component, forwardRef, Input } from '@angular/core';
import { ControlValueAccessor, FormControl, NG_VALUE_ACCESSOR, ReactiveFormsModule } from '@angular/forms';

/**
 * A styled checkbox component with reactive forms support.
 */
@Component({
  selector: 'cms-checkbox',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <label class="inline-flex items-center gap-2 cursor-pointer" [class.opacity-50]="disabled">
      <input
        type="checkbox"
        [formControl]="formCtrl"
        class="w-4 h-4 rounded border-gray-300 dark:border-gray-600 text-primary-600 focus:ring-primary-500 dark:bg-gray-700 dark:checked:bg-primary-600"
        [class.cursor-not-allowed]="disabled"
      />
      @if (label) {
        <span class="text-sm text-gray-700 dark:text-gray-300">{{ label }}</span>
      }
    </label>
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
      useExisting: forwardRef(() => CheckboxComponent),
    },
  ]
})
export class CheckboxComponent implements ControlValueAccessor {
  /** Checkbox label */
  @Input() label?: string;
  /** Disabled state */
  @Input() disabled = false;

  formCtrl = new FormControl(false);

  writeValue(val: boolean): void {
    this.formCtrl.setValue(val, { emitEvent: false });
  }

  registerOnChange(fn: (val: boolean | null) => void): void {
    this.formCtrl.valueChanges.subscribe(fn);
  }

  registerOnTouched(_fn: () => void): void {
    // Not needed for checkbox
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
