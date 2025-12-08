import { Component, inject } from '@angular/core';
import { TranslationService } from '@cms/shared/utils';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CustomizationStateService } from '@cms/shared/customization-services';
import {
  LayoutSettings,
  HeaderTemplate,
  FooterTemplate,
  Placement
} from '@cms/shared/customization-models';
import { IconComponent } from '@cms/shared/ui';

interface TemplateOption<T> {
  value: T;
  label: string;
  description: string;
  icon: string;
}

@Component({
  selector: 'cms-layout-step',
  standalone: true,
  imports: [CommonModule, FormsModule, IconComponent],
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

  updateSpacing(key: keyof LayoutSettings['spacing'], value: number) {
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
