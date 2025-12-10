import { CommonModule } from '@angular/common';
import { Component, forwardRef, Input } from '@angular/core';
import { ControlValueAccessor, FormControl, NG_VALUE_ACCESSOR, ReactiveFormsModule } from '@angular/forms';

/**
 * A styled select dropdown component with reactive forms support.
 */
@Component({
  selector: 'cms-select',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="w-full">
      @if (label) {
        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          {{ label }}
          @if (required) {
            <span class="text-red-500">*</span>
          }
        </label>
      }
      <select
        [formControl]="formCtrl"
        class="block w-full rounded-lg border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm focus:border-primary-500 focus:ring-primary-500 text-sm py-2 px-3"
        [class.border-red-500]="error"
        [class.focus:ring-red-500]="error"
      >
        @if (placeholder) {
          <option value="" disabled>{{ placeholder }}</option>
        }
        @for (option of options; track getOptionValue(option)) {
          <option [value]="getOptionValue(option)">{{ getOptionLabel(option) }}</option>
        }
      </select>
      @if (error) {
        <p class="mt-1 text-sm text-red-500">{{ error }}</p>
      }
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }
  `],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      multi: true,
      useExisting: forwardRef(() => SelectComponent),
    },
  ]
})
export class SelectComponent implements ControlValueAccessor {
  /** Field label */
  @Input() label?: string;
  /** Options array */
  @Input() options: unknown[] = [];
  /** Property name for option display text */
  @Input() optionLabel = 'label';
  /** Property name for option value */
  @Input() optionValue = 'value';
  /** Placeholder text */
  @Input() placeholder?: string;
  /** Required indicator */
  @Input() required = false;
  /** Error message */
  @Input() error?: string;

  formCtrl = new FormControl('');

  getOptionLabel(option: unknown): string {
    if (typeof option === 'string' || typeof option === 'number') {
      return String(option);
    }
    return (option as Record<string, unknown>)[this.optionLabel] as string;
  }

  getOptionValue(option: unknown): unknown {
    if (typeof option === 'string' || typeof option === 'number') {
      return option;
    }
    return (option as Record<string, unknown>)[this.optionValue];
  }

  writeValue(val: unknown): void {
    this.formCtrl.setValue(val as string, { emitEvent: false });
  }

  registerOnChange(fn: (val: unknown) => void): void {
    this.formCtrl.valueChanges.subscribe(fn);
  }

  registerOnTouched(_fn: () => void): void {
    // Not needed
  }

  setDisabledState(isDisabled: boolean): void {
    if (isDisabled) {
      this.formCtrl.disable({ emitEvent: false });
    } else {
      this.formCtrl.enable({ emitEvent: false });
    }
  }
}
