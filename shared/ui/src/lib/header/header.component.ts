import { Component, input, Type } from '@angular/core';
import { CommonModule, NgComponentOutlet } from '@angular/common';
import { HeaderTemplate } from '@cms/shared/customization-models';
import { HeaderMinimalComponent } from './templates/header-minimal/header-minimal.component';
import { HeaderStandardComponent } from './templates/header-standard/header-standard.component';
import { HeaderFullComponent } from './templates/header-full/header-full.component';

/**
 * Main header component that dynamically loads the appropriate template
 * based on the HeaderTemplate configuration.
 */
@Component({
  selector: 'cms-header',
  standalone: true,
  imports: [
    CommonModule,
    NgComponentOutlet,
    HeaderMinimalComponent,
    HeaderStandardComponent,
    HeaderFullComponent,
  ],
  template: `
    @if (activeTemplateComponent) {
      <ng-container *ngComponentOutlet="activeTemplateComponent; inputs: templateInputs" />
    }
  `,
})
export class HeaderComponent {
  // Template configuration
  template = input<HeaderTemplate>(HeaderTemplate.Standard);

  // Brand configuration
  logoUrl = input<string | null>(null);
  logoAlt = input<string>('Logo');
  siteName = input<string>('My Site');
  tagline = input<string | null>(null);
  showSiteName = input<boolean>(true);
  maxLogoHeight = input<number>(48);

  // Layout configuration
  logoPlacement = input<'left' | 'center' | 'right'>('left');
  showSearch = input<boolean>(true);
  searchPlaceholder = input<string>('Search...');
  showUserAccount = input<boolean>(false);
  showTopBar = input<boolean>(false);
  topBarMessage = input<string>('Welcome to our site!');
  isSticky = input<boolean>(true);
  maxWidth = input<number>(1280);

  // Navigation
  navItems = input<any[]>([]);

  /**
   * Maps HeaderTemplate enum values to component types.
   */
  private readonly TEMPLATE_MAP: Record<HeaderTemplate, Type<any>> = {
    [HeaderTemplate.Minimal]: HeaderMinimalComponent,
    [HeaderTemplate.Standard]: HeaderStandardComponent,
    [HeaderTemplate.Full]: HeaderFullComponent,
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
      logoUrl: this.logoUrl(),
      logoAlt: this.logoAlt(),
      siteName: this.siteName(),
      tagline: this.tagline(),
      showSiteName: this.showSiteName(),
      maxLogoHeight: this.maxLogoHeight(),
      logoPlacement: this.logoPlacement(),
      showSearch: this.showSearch(),
      searchPlaceholder: this.searchPlaceholder(),
      showUserAccount: this.showUserAccount(),
      showTopBar: this.showTopBar(),
      topBarMessage: this.topBarMessage(),
      isSticky: this.isSticky(),
      maxWidth: this.maxWidth(),
      navItems: this.navItems(),
    };
  }
}
