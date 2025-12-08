import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CustomizationStateService } from '@cms/shared/customization-services';
import { IconComponent } from '@cms/shared/ui';
import { TranslationService } from '@cms/shared/utils';

@Component({
  selector: 'cms-developer-step',
  standalone: true,
  imports: [CommonModule, IconComponent],
  templateUrl: './developer-step.component.html',
  styleUrls: ['./developer-step.component.scss']
})
export class DeveloperStepComponent {
  private readonly customizationState = inject(CustomizationStateService);
  private readonly translate = inject(TranslationService);

  protected readonly loading = this.customizationState.loading;
  protected readonly error = this.customizationState.error;
  protected readonly theme = this.customizationState.theme;
  protected readonly typography = this.customizationState.typography;
  protected readonly layout = this.customizationState.layout;
  protected readonly hasUnsavedChanges = this.customizationState.hasUnsavedChanges;

  protected actionMessage = signal<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);
  protected resetConfirmVisible = signal(false);

  /**
   * Load newest configuration from backend
   */
  protected async loadNewestConfig(): Promise<void> {
    try {
      this.actionMessage.set({ type: 'info', text: 'Loading configuration from server...' });

      await this.customizationState.loadAllSettings();

      this.actionMessage.set({
        type: 'success',
        text: 'Configuration loaded successfully from server'
      });

      this.clearMessageAfterDelay();
    } catch (error) {
      console.error('Failed to load config:', error);
      this.actionMessage.set({
        type: 'error',
        text: 'Failed to load configuration from server. Please try again.'
      });
    }
  }

  /**
   * Save current configuration to backend
   */
  protected async saveCurrentConfig(): Promise<void> {
    try {
      this.actionMessage.set({ type: 'info', text: 'Saving configuration to server...' });

      const theme = this.customizationState.theme();
      const typography = this.customizationState.typography();
      const layout = this.customizationState.layout();

      if (!theme || !typography || !layout) {
        this.actionMessage.set({
          type: 'error',
          text: 'No configuration to save. Please configure theme, typography, and layout first.'
        });
        return;
      }

      // Save all settings
      await Promise.all([
        this.customizationState.updateTheme(theme),
        this.customizationState.updateTypography(typography),
        this.customizationState.updateLayout(layout)
      ]);

      this.actionMessage.set({
        type: 'success',
        text: 'Configuration saved successfully to server'
      });

      this.clearMessageAfterDelay();
    } catch (error) {
      console.error('Failed to save config:', error);
      this.actionMessage.set({
        type: 'error',
        text: 'Failed to save configuration to server. Please try again.'
      });
    }
  }

  /**
   * Show reset confirmation dialog
   */
  protected showResetConfirmation(): void {
    this.resetConfirmVisible.set(true);
  }

  /**
   * Cancel reset
   */
  protected cancelReset(): void {
    this.resetConfirmVisible.set(false);
  }

  /**
   * Reset configuration to defaults (permanent)
   */
  protected async confirmReset(): Promise<void> {
    this.resetConfirmVisible.set(false);

    try {
      this.actionMessage.set({ type: 'info', text: 'Resetting configuration to defaults...' });

      // Reset to saved state (which will be defaults if never saved)
      this.customizationState.resetToSaved();

      // Optionally, you could also reset localStorage here
      localStorage.removeItem('cms_customization_theme');
      localStorage.removeItem('cms_customization_typography');
      localStorage.removeItem('cms_customization_layout');

      // Reload from server to get defaults
      await this.customizationState.loadAllSettings();

      this.actionMessage.set({
        type: 'success',
        text: 'Configuration reset to defaults successfully'
      });

      this.clearMessageAfterDelay();
    } catch (error) {
      console.error('Failed to reset config:', error);
      this.actionMessage.set({
        type: 'error',
        text: 'Failed to reset configuration. Please try again.'
      });
    }
  }

  /**
   * Export configuration as JSON file
   */
  protected exportConfig(): void {
    try {
      const config = {
        theme: this.customizationState.theme(),
        typography: this.customizationState.typography(),
        layout: this.customizationState.layout(),
        exportedAt: new Date().toISOString(),
        version: '1.0'
      };

      const blob = new Blob([JSON.stringify(config, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `cms-config-${new Date().toISOString().split('T')[0]}.json`;
      link.click();
      URL.revokeObjectURL(url);

      this.actionMessage.set({
        type: 'success',
        text: 'Configuration exported successfully'
      });

      this.clearMessageAfterDelay();
    } catch (error) {
      console.error('Failed to export config:', error);
      this.actionMessage.set({
        type: 'error',
        text: 'Failed to export configuration'
      });
    }
  }

  /**
   * Import configuration from JSON file
   */
  protected importConfig(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const config = JSON.parse(content);

        if (!config.theme || !config.typography || !config.layout) {
          throw new Error('Invalid configuration file format');
        }

        // Apply imported configuration locally
        if (config.theme) this.customizationState.setThemeLocal(config.theme);
        if (config.typography) this.customizationState.setTypographyLocal(config.typography);
        if (config.layout) this.customizationState.setLayoutLocal(config.layout);

        this.actionMessage.set({
          type: 'success',
          text: 'Configuration imported successfully. Remember to save to apply permanently.'
        });

        this.clearMessageAfterDelay();
      } catch (error) {
        console.error('Failed to import config:', error);
        this.actionMessage.set({
          type: 'error',
          text: 'Failed to import configuration. Invalid file format.'
        });
      }

      // Reset input
      input.value = '';
    };

    reader.readAsText(file);
  }

  /**
   * Clear message after delay
   */
  private clearMessageAfterDelay(): void {
    setTimeout(() => {
      this.actionMessage.set(null);
    }, 5000);
  }

  /**
   * Get message CSS classes
   */
  protected getMessageClasses(type: 'success' | 'error' | 'info'): string {
    const baseClasses = 'p-4 rounded-md mb-4';

    switch (type) {
      case 'success':
        return `${baseClasses} bg-green-50 text-green-800 border border-green-200`;
      case 'error':
        return `${baseClasses} bg-red-50 text-red-800 border border-red-200`;
      case 'info':
        return `${baseClasses} bg-blue-50 text-blue-800 border border-blue-200`;
      default:
        return baseClasses;
    }
  }
}
