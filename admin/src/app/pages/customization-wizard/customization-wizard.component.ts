import { Component, OnInit, inject, signal } from '@angular/core';

import { Router } from '@angular/router';

import { ThemeStepComponent } from './steps/theme-step/theme-step.component';
import { TypographyStepComponent } from './steps/typography-step/typography-step.component';
import { LayoutStepComponent } from './steps/layout-step/layout-step.component';
import { DeveloperStepComponent } from './steps/developer-step/developer-step.component';
import { SystemInfoStepComponent } from './steps/system-info-step/system-info-step.component';
import { IconComponent, LanguageSelectorComponent } from '@cms/shared/ui';
import { ThemeService, TranslationService, CustomizationStateService, ToasterService, AuthService } from '@cms/shared/utils';

export type WizardStep = 'theme' | 'typography' | 'layout' | 'developer' | 'system-info';

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
    ThemeStepComponent,
    TypographyStepComponent,
    LayoutStepComponent,
    DeveloperStepComponent,
    SystemInfoStepComponent,
    IconComponent,
    LanguageSelectorComponent
],
  templateUrl: './customization-wizard.component.html',
  styleUrls: ['./customization-wizard.component.scss']
})
export class CustomizationWizardComponent implements OnInit {
  private readonly customizationState = inject(CustomizationStateService);
  private readonly router = inject(Router);
  private readonly toaster = inject(ToasterService);
  private readonly themeService = inject(ThemeService);
  protected readonly authService = inject(AuthService);
  protected readonly translate = inject(TranslationService);
  protected readonly currentUser = this.authService.currentUser;
  protected readonly currentTheme = this.themeService.currentTheme;

  readonly steps: IWizardStep[] = [    {      key: 'theme',      title: 'customization.theme.title',      description: 'customization.theme.description',      icon: 'palette',      iconStyle: 'solid'    },    {      key: 'typography',      title: 'customization.typography.title',      description: 'customization.typography.description',      icon: 'font',      iconStyle: 'solid'    },    {      key: 'layout',      title: 'customization.layout.title',      description: 'customization.layout.description',      icon: 'layout',      iconStyle: 'solid'    },    {      key: 'developer',      title: 'customization.developer.title',      description: 'customization.developer.description',      icon: 'code',      iconStyle: 'solid'    },    {      key: 'system-info',      title: 'customization.systemInfo.title',      description: 'customization.systemInfo.description',      icon: 'info',      iconStyle: 'solid'    }  ];

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

      this.toaster.success("Customization settings saved successfully!");
    } catch (error) {
      console.error('Failed to save customization:', error);
      this.toaster.error('Failed to save customization settings. Please try again.');
    } finally {
      this.saving.set(false);
    }
  }

  async closeWithoutSaving() {
    if (this.hasChanges() && !confirm('You have unsaved changes. Are you sure you want to close without saving?')) {
      return;
    }

    this.customizationState.resetToSaved();
  }

  toggleTheme(): void {
    this.themeService.toggleTheme();
  }

  onLogout(): void {
    this.authService.logout().subscribe({
      next: () => {
        this.router.navigate(['"/login"']);
      },
    });
  }


  resetToDefaults() {
    if (confirm('Are you sure you want to reset all settings to defaults? This cannot be undone.')) {
      this.customizationState.resetToSaved();
    }
  }
}
