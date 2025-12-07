import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { CustomizationStateService } from '@cms/shared/customization-services';
import { ThemeStepComponent } from './steps/theme-step/theme-step.component';
import { TypographyStepComponent } from './steps/typography-step/typography-step.component';
import { LayoutStepComponent } from './steps/layout-step/layout-step.component';
import { IconComponent } from '@cms/shared/ui';

export type WizardStep = 'theme' | 'typography' | 'layout';

interface IWizardStep {
  key: WizardStep;
  title: string;
  description: string;
  icon: string;
  iconStyle: 'solid' | 'regular';
}

@Component({
  selector: 'cms-customization-wizard',
  standalone: true,
  imports: [
    CommonModule,
    ThemeStepComponent,
    TypographyStepComponent,
    LayoutStepComponent,
    IconComponent
  ],
  templateUrl: './customization-wizard.component.html',
  styleUrls: ['./customization-wizard.component.scss']
})
export class CustomizationWizardComponent implements OnInit {
  private readonly customizationState = inject(CustomizationStateService);
  private readonly router = inject(Router);

  readonly steps: IWizardStep[] = [
    {
      key: 'theme',
      title: 'Theme & Colors',
      description: 'Customize your color palette',
      icon: 'palette',
      iconStyle: 'solid'
    },
    {
      key: 'typography',
      title: 'Typography',
      description: 'Configure fonts and text styles',
      icon: 'font',
      iconStyle: 'solid'
    },
    {
      key: 'layout',
      title: 'Layout',
      description: 'Adjust header, footer, and spacing',
      icon: 'layout',
      iconStyle: 'solid'
    }
  ];

  activeStep = signal<WizardStep>('theme');
  saving = signal<boolean>(false);
  mobileMenuOpen = false;

  readonly hasChanges = this.customizationState.hasUnsavedChanges;
  readonly loading = this.customizationState.loading;
  readonly error = this.customizationState.error;

  async ngOnInit() {
    await this.customizationState.loadAllSettings();
  }

  setActiveStep(step: WizardStep) {
    this.activeStep.set(step);
  }

  async saveAndClose(): Promise<void> {
    try {
      this.saving.set(true);

      const theme = this.customizationState.theme();
      const typography = this.customizationState.typography();
      const layout = this.customizationState.layout();

      if (theme) await this.customizationState.updateTheme(theme);
      if (typography) await this.customizationState.updateTypography(typography);
      if (layout) await this.customizationState.updateLayout(layout);

      await this.router.navigate(['/dashboard']);
    } catch (error) {
      console.error('Failed to save customization:', error);
    } finally {
      this.saving.set(false);
    }
  }

  async closeWithoutSaving() {
    if (this.hasChanges() && !confirm('You have unsaved changes. Are you sure you want to close without saving?')) {
      return;
    }

    this.customizationState.resetToSaved();
    await this.router.navigate(['/dashboard']);
  }

  resetToDefaults() {
    if (confirm('Are you sure you want to reset all settings to defaults? This cannot be undone.')) {
      this.customizationState.resetToSaved();
    }
  }
}
