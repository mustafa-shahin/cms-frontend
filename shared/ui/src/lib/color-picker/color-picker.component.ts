import { Component, input, model, output } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'cms-color-picker',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './color-picker.component.html',
})
export class ColorPickerComponent {
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
   * Handle color change from inputs
   */
  protected onColorChange(newColor: string): void {
    this.color.set(newColor);
    this.colorChange.emit(newColor);
  }
}
