import { Component, inject } from '@angular/core';
import { TranslationService, CustomizationStateService } from '@cms/shared/utils';
import { FormsModule } from '@angular/forms';
import { IconComponent, ToggleComponent, SelectComponent } from '@cms/shared/ui';
import {
  LayoutSettings,
  HeaderTemplate,
  FooterTemplate,
  Placement
} from '@cms/shared/customization-models';

interface TemplateOption<T> {
  value: T;
  label: string;
  description: string;
  icon: string;
}

@Component({
  selector: 'cms-layout-step',
  standalone: true,
  imports: [FormsModule, IconComponent, ToggleComponent, SelectComponent],
  templateUrl: './layout-step.component.html',
  styleUrls: ['./layout-step.component.scss']
})
export class LayoutStepComponent {
  private readonly customizationState = inject(CustomizationStateService);
  protected readonly translate = inject(TranslationService);

  readonly layout = this.customizationState.layout;

  parseInt(value: string): number {
    return parseInt(value, 10);
  }

  // Reactive translation helper
  t(key: string): string {
    this.translate.currentLanguage(); // Register signal dependency
    return this.translate.instant(key);
  }

  readonly headerTemplates: TemplateOption<HeaderTemplate>[] = [
    {
      value: HeaderTemplate.Minimal,
      label: 'Minimal',
      description: 'Logo and navigation only',
      icon: 'minus'
    },
    {
      value: HeaderTemplate.Standard,
      label: 'Standard',
      description: 'Logo, navigation, and search',
      icon: 'equals'
    },
    {
      value: HeaderTemplate.Full,
      label: 'Full',
      description: 'Complete header with all features',
      icon: 'bars'
    }
  ];

  readonly footerTemplates: TemplateOption<FooterTemplate>[] = [
    {
      value: FooterTemplate.Minimal,
      label: 'Minimal',
      description: 'Copyright and legal links',
      icon: 'minus'
    },
    {
      value: FooterTemplate.Standard,
      label: 'Standard',
      description: 'Links, social, and copyright',
      icon: 'equals'
    },
    {
      value: FooterTemplate.Full,
      label: 'Full',
      description: 'Multi-column with newsletter',
      icon: 'bars'
    }
  ];

  readonly logoPlacementOptions: TemplateOption<Placement>[] = [
    {
      value: Placement.Left,
      label: 'Left',
      description: 'Align logo to the left',
      icon: 'align-left'
    },
    {
      value: Placement.Center,
      label: 'Center',
      description: 'Center the logo',
      icon: 'align-center'
    },
    {
      value: Placement.Right,
      label: 'Right',
      description: 'Align logo to the right',
      icon: 'align-right'
    }
  ];

  updateHeader<K extends keyof LayoutSettings['headerConfiguration']>(
    key: K,
    value: LayoutSettings['headerConfiguration'][K]
  ) {
    this.updateHeaderConfig({ [key]: value } as Partial<LayoutSettings['headerConfiguration']>);
  }

  updateFooter<K extends keyof LayoutSettings['footerConfiguration']>(
    key: K,
    value: LayoutSettings['footerConfiguration'][K]
  ) {
    this.updateFooterConfig({ [key]: value } as Partial<LayoutSettings['footerConfiguration']>);
  }

  removePx(value: string | number): number {
    if (typeof value === 'number') return value;
    return value ? parseInt(value.replace('px', ''), 10) : 0;
  }

  updateHeaderConfig(updates: Partial<LayoutSettings['headerConfiguration']>) {
    const currentLayout = this.layout();
    if (!currentLayout) return;

    const updatedLayout: LayoutSettings = {
      ...currentLayout,
      headerConfiguration: {
        ...currentLayout.headerConfiguration,
        ...updates
      }
    };

    this.customizationState.setLayoutLocal(updatedLayout);
  }

  updateFooterConfig(updates: Partial<LayoutSettings['footerConfiguration']>) {
    const currentLayout = this.layout();
    if (!currentLayout) return;

    const updatedLayout: LayoutSettings = {
      ...currentLayout,
      footerConfiguration: {
        ...currentLayout.footerConfiguration,
        ...updates
      }
    };

    this.customizationState.setLayoutLocal(updatedLayout);
  }

  get paddingOptions() {
    return [
      { value: '2rem 1rem', label: (this.t('common.compact') || 'Compact') + ' (2rem)' },
      { value: '4rem 1.5rem', label: (this.t('common.comfortable') || 'Comfortable') + ' (4rem)' },
      { value: '6rem 2rem', label: (this.t('common.spacious') || 'Spacious') + ' (6rem)' }
    ];
  }

  get gapOptions() {
    return [
      { value: '1rem', label: (this.t('common.compact') || 'Compact') + ' (1rem)' },
      { value: '2rem', label: (this.t('common.comfortable') || 'Comfortable') + ' (2rem)' },
      { value: '3rem', label: (this.t('common.spacious') || 'Spacious') + ' (3rem)' }
    ];
  }

  updateSpacing(key: keyof LayoutSettings['spacing'], value: number | string) {
    const currentLayout = this.layout();
    if (!currentLayout) return;

    const updatedLayout: LayoutSettings = {
      ...currentLayout,
      spacing: {
        ...currentLayout.spacing,
        [key]: value
      }
    };

    this.customizationState.setLayoutLocal(updatedLayout);
  }

  HeaderTemplate = HeaderTemplate;
  FooterTemplate = FooterTemplate;
  Placement = Placement;
}
