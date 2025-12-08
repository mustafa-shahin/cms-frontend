import { Component, input, Type } from '@angular/core';
import { CommonModule, NgComponentOutlet } from '@angular/common';
import { FooterTemplate } from '@cms/shared/customization-models';
import { FooterMinimalComponent } from './templates/footer-minimal/footer-minimal.component';
import { FooterStandardComponent } from './templates/footer-standard/footer-standard.component';
import { FooterFullComponent } from './templates/footer-full/footer-full.component';

/**
 * Main footer component that dynamically loads the appropriate template
 * based on the FooterTemplate configuration.
 */
@Component({
  selector: 'cms-footer',
  standalone: true,
  imports: [
    CommonModule,
    NgComponentOutlet,
    FooterMinimalComponent,
    FooterStandardComponent,
    FooterFullComponent,
  ],
  template: `
    @if (activeTemplateComponent) {
      <ng-container *ngComponentOutlet="activeTemplateComponent; inputs: templateInputs" />
    }
  `,
})
export class FooterComponent {
  // Template configuration
  template = input<FooterTemplate>(FooterTemplate.Standard);

  // Brand configuration
  siteName = input<string>('My Site');
  tagline = input<string | null>(null);
  description = input<string | null>(null);
  logoUrl = input<string | null>(null);
  logoAlt = input<string>('Logo');
  maxLogoHeight = input<number>(40);
  showSiteName = input<boolean>(true);

  // Features
  showSocialLinks = input<boolean>(true);
  showNewsletter = input<boolean>(false);
  showPaymentMethods = input<boolean>(false);

  // Content
  socialLinks = input<any[]>([]);
  columns = input<any[]>([]);
  columnCount = input<number>(3);

  // Layout
  maxWidth = input<number>(1280);

  /**
   * Maps FooterTemplate enum values to component types.
   */
  private readonly TEMPLATE_MAP: Record<FooterTemplate, Type<any>> = {
    [FooterTemplate.Minimal]: FooterMinimalComponent,
    [FooterTemplate.Standard]: FooterStandardComponent,
    [FooterTemplate.Full]: FooterFullComponent,
  };

  /**
   * Get the component type for the active template.
   */
  get activeTemplateComponent(): Type<any> | null {
    return this.TEMPLATE_MAP[this.template()] || null;
  }

  /**
   * Get inputs to pass to the template component.
   */
  get templateInputs(): Record<string, any> {
    return {
      siteName: this.siteName(),
      tagline: this.tagline(),
      description: this.description(),
      logoUrl: this.logoUrl(),
      logoAlt: this.logoAlt(),
      maxLogoHeight: this.maxLogoHeight(),
      showSiteName: this.showSiteName(),
      showSocialLinks: this.showSocialLinks(),
      showNewsletter: this.showNewsletter(),
      showPaymentMethods: this.showPaymentMethods(),
      socialLinks: this.socialLinks(),
      columns: this.columns(),
      columnCount: this.columnCount(),
      maxWidth: this.maxWidth(),
    };
  }
}
