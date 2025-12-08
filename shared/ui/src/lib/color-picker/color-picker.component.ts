import { Component, input, model, output, signal, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ColorUtilsService } from '@cms/shared/utils';

@Component({
  selector: 'cms-color-picker',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './color-picker.component.html',
})
export class ColorPickerComponent {
  private readonly colorUtils = inject(ColorUtilsService);

  /**
   * Label for the color picker
   */
  label = input.required<string>();

  /**
   * Placeholder text for the hex input
   */
  placeholder = input<string>('#000000');

  /**
   * Two-way bindable color value
   */
  color = model.required<string>();

  /**
   * Event emitted when color changes
   */
  colorChange = output<string>();

  /**
   * Validation error message
   */
  protected errorMessage = signal<string | null>(null);

  /**
   * Whether to show validation errors
   */
  showValidation = input<boolean>(true);

  /**
   * Handle color change from inputs
   */
  protected onColorChange(newColor: string): void {
    // Clear previous error
    this.errorMessage.set(null);

    // Trim whitespace
    newColor = newColor.trim();

    // Validate hex color format if validation is enabled
    if (this.showValidation() && newColor) {
      if (!this.colorUtils.isValidHex(newColor)) {
        this.errorMessage.set('Invalid hex color format. Use #RRGGBB or #RGB');
        return; // Don't update if invalid
      }

      // Normalize to 6-digit format
      newColor = this.colorUtils.normalizeHex(newColor);
    }

    // Update the color
    this.color.set(newColor);
    this.colorChange.emit(newColor);
  }

  /**
   * Get the current error message
   */
  getError(): string | null {
    return this.errorMessage();
  }

  /**
   * Check if the current color is valid
   */
  isValid(): boolean {
    return this.errorMessage() === null;
  }
}
