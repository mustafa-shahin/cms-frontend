import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslationService, CustomizationStateService, AuthService } from '@cms/shared/utils';
import { ButtonComponent, IconComponent } from '@cms/shared/ui';

export interface SystemInfo {
  category: string;
  items: Array<{ label: string; value: string | number | boolean; type?: 'text' | 'boolean' | 'date' | 'number' }>;
}

@Component({
  selector: 'cms-system-info-step',
  standalone: true,
  imports: [CommonModule, IconComponent, ButtonComponent],
  templateUrl: './system-info-step.component.html',
})
export class SystemInfoStepComponent implements OnInit {
  private readonly customizationState = inject(CustomizationStateService);
  protected readonly translate = inject(TranslationService);
  private readonly authService = inject(AuthService);

  protected systemInfo = signal<SystemInfo[]>([]);

  ngOnInit(): void {
    this.loadSystemInfo();
  }

  /**
   * Load system information
   */
  private loadSystemInfo(): void {
    const theme = this.customizationState.theme();
    const typography = this.customizationState.typography();
    const layout = this.customizationState.layout();
    const currentUser = this.authService.currentUser();

    const info: SystemInfo[] = [
      {
        category: this.translate.instant('customization.systemInfo.categories.appInfo'),
        items: [
          { label: this.translate.instant('customization.systemInfo.labels.appName'), value: 'CMS Frontend', type: 'text' },
          { label: this.translate.instant('customization.systemInfo.labels.version'), value: '1.0.0', type: 'text' },
          { label: this.translate.instant('customization.systemInfo.labels.env'), value: this.getEnvironment(), type: 'text' },
          { label: this.translate.instant('customization.systemInfo.labels.buildDate'), value: new Date().toISOString(), type: 'date' }
        ]
      },
      {
        category: this.translate.instant('customization.systemInfo.categories.userInfo'),
        items: [
          { label: this.translate.instant('customization.systemInfo.labels.userId'), value: currentUser?.id || this.translate.instant('customization.systemInfo.values.na'), type: 'text' },
          { label: this.translate.instant('customization.systemInfo.labels.username'), value: currentUser?.fullName || this.translate.instant('customization.systemInfo.values.na'), type: 'text' },
          { label: this.translate.instant('customization.systemInfo.labels.email'), value: currentUser?.email || this.translate.instant('customization.systemInfo.values.na'), type: 'text' },
          { label: this.translate.instant('customization.systemInfo.labels.role'), value: currentUser?.role || this.translate.instant('customization.systemInfo.values.na'), type: 'text' },
          { label: this.translate.instant('customization.systemInfo.labels.authenticated'), value: !!currentUser, type: 'boolean' }
        ]
      },
      {
        category: this.translate.instant('customization.systemInfo.categories.configStatus'),
        items: [
          { label: this.translate.instant('customization.systemInfo.labels.themeConfigured'), value: !!theme, type: 'boolean' },
          { label: this.translate.instant('customization.systemInfo.labels.typographyConfigured'), value: !!typography, type: 'boolean' },
          { label: this.translate.instant('customization.systemInfo.labels.layoutConfigured'), value: !!layout, type: 'boolean' },
          { label: this.translate.instant('customization.systemInfo.labels.hasUnsavedChanges'), value: this.customizationState.hasUnsavedChanges(), type: 'boolean' },
          { label: this.translate.instant('customization.systemInfo.labels.themeLastMod'), value: theme?.lastModifiedAt || this.translate.instant('customization.systemInfo.values.never'), type: 'text' },
          { label: this.translate.instant('customization.systemInfo.labels.typographyLastMod'), value: typography?.lastModifiedAt || this.translate.instant('customization.systemInfo.values.never'), type: 'text' },
          { label: this.translate.instant('customization.systemInfo.labels.layoutLastMod'), value: layout?.lastModifiedAt || this.translate.instant('customization.systemInfo.values.never'), type: 'text' }
        ]
      },
      {
        category: this.translate.instant('customization.systemInfo.categories.themeConfig'),
        items: theme ? [
          { label: this.translate.instant('customization.systemInfo.labels.brandPrimary'), value: theme.brandPalette.primary.base, type: 'text' },
          { label: this.translate.instant('customization.systemInfo.labels.brandSecondary'), value: theme.brandPalette.secondary.base, type: 'text' },
          { label: this.translate.instant('customization.systemInfo.labels.brandAccent'), value: theme.brandPalette.accent.base, type: 'text' },
          { label: this.translate.instant('customization.systemInfo.labels.lastModBy'), value: theme.lastModifiedBy || this.translate.instant('customization.systemInfo.values.system'), type: 'text' }
        ] : [
          { label: this.translate.instant('customization.systemInfo.labels.status'), value: this.translate.instant('customization.systemInfo.values.notConfigured'), type: 'text' }
        ]
      },
      {
        category: this.translate.instant('customization.systemInfo.categories.typographyConfig'),
        items: typography ? [
          { label: this.translate.instant('customization.systemInfo.labels.primaryFont'), value: typography.primaryFontFamily, type: 'text' },
          { label: this.translate.instant('customization.systemInfo.labels.secondaryFont'), value: typography.secondaryFontFamily, type: 'text' },
          { label: this.translate.instant('customization.systemInfo.labels.monoFont'), value: typography.monoFontFamily, type: 'text' },
          { label: this.translate.instant('customization.systemInfo.labels.textStylesCount'), value: Object.keys(typography.textStyles).length, type: 'number' },
          { label: this.translate.instant('customization.systemInfo.labels.lastModBy'), value: typography.lastModifiedBy || this.translate.instant('customization.systemInfo.values.system'), type: 'text' }
        ] : [
          { label: this.translate.instant('customization.systemInfo.labels.status'), value: this.translate.instant('customization.systemInfo.values.notConfigured'), type: 'text' }
        ]
      },
      {
        category: this.translate.instant('customization.systemInfo.categories.layoutConfig'),
        items: layout ? [
          { label: this.translate.instant('customization.systemInfo.labels.headerTemplate'), value: this.getHeaderTemplateName(layout.headerConfiguration.template), type: 'text' },
          { label: this.translate.instant('customization.systemInfo.labels.headerLogoPlacement'), value: this.getPlacementName(layout.headerConfiguration.logoPlacement), type: 'text' },
          { label: this.translate.instant('customization.systemInfo.labels.headerShowSearch'), value: layout.headerConfiguration.showSearch, type: 'boolean' },
          { label: this.translate.instant('customization.systemInfo.labels.headerSticky'), value: layout.headerConfiguration.stickyHeader, type: 'boolean' },
          { label: this.translate.instant('customization.systemInfo.labels.footerTemplate'), value: this.getFooterTemplateName(layout.footerConfiguration.template), type: 'text' },
          { label: this.translate.instant('customization.systemInfo.labels.footerColumns'), value: layout.footerConfiguration.columnCount, type: 'number' },
          { label: this.translate.instant('customization.systemInfo.labels.footerShowSocial'), value: layout.footerConfiguration.showSocialLinks, type: 'boolean' },
          { label: this.translate.instant('customization.systemInfo.labels.footerShowNewsletter'), value: layout.footerConfiguration.showNewsletter, type: 'boolean' },
          { label: this.translate.instant('customization.systemInfo.labels.containerMaxWidth'), value: `${layout.spacing.containerMaxWidth}px`, type: 'text' },
          { label: this.translate.instant('customization.systemInfo.labels.sectionPadding'), value: `${layout.spacing.sectionPadding}rem`, type: 'text' },
          { label: this.translate.instant('customization.systemInfo.labels.componentGap'), value: `${layout.spacing.componentGap}rem`, type: 'text' },
          { label: this.translate.instant('customization.systemInfo.labels.lastModBy'), value: layout.lastModifiedBy || this.translate.instant('customization.systemInfo.values.system'), type: 'text' }
        ] : [
          { label: this.translate.instant('customization.systemInfo.labels.status'), value: this.translate.instant('customization.systemInfo.values.notConfigured'), type: 'text' }
        ]
      },
      {
        category: this.translate.instant('customization.systemInfo.categories.browserInfo'),
        items: [
          { label: this.translate.instant('customization.systemInfo.labels.userAgent'), value: navigator.userAgent, type: 'text' },
          { label: this.translate.instant('customization.systemInfo.labels.platform'), value: navigator.platform, type: 'text' },
          { label: this.translate.instant('customization.systemInfo.labels.language'), value: navigator.language, type: 'text' },
          { label: this.translate.instant('customization.systemInfo.labels.online'), value: navigator.onLine, type: 'boolean' },
          { label: this.translate.instant('customization.systemInfo.labels.cookiesEnabled'), value: navigator.cookieEnabled, type: 'boolean' }
        ]
      },
      {
        category: this.translate.instant('customization.systemInfo.categories.storageInfo'),
        items: [
          { label: this.translate.instant('customization.systemInfo.labels.localStorageAvail'), value: this.isLocalStorageAvailable(), type: 'boolean' },
          { label: this.translate.instant('customization.systemInfo.labels.localStorageUsage'), value: this.getLocalStorageUsage(), type: 'text' },
          { label: this.translate.instant('customization.systemInfo.labels.sessionStorageAvail'), value: this.isSessionStorageAvailable(), type: 'boolean' }
        ]
      },
      {
        category: this.translate.instant('customization.systemInfo.categories.performance'),
        items: [
          { label: this.translate.instant('customization.systemInfo.labels.pageLoadTime'), value: this.getPageLoadTime(), type: 'text' },
          { label: this.translate.instant('customization.systemInfo.labels.domContentLoaded'), value: this.getDOMContentLoadedTime(), type: 'text' },
          { label: this.translate.instant('customization.systemInfo.labels.windowWidth'), value: `${window.innerWidth}px`, type: 'text' },
          { label: this.translate.instant('customization.systemInfo.labels.windowHeight'), value: `${window.innerHeight}px`, type: 'text' },
          { label: this.translate.instant('customization.systemInfo.labels.pixelRatio'), value: window.devicePixelRatio, type: 'number' }
        ]
      }
    ];

    this.systemInfo.set(info);
  }

  /**
   * Get environment (production, development, etc.)
   */
  private getEnvironment(): string {
    return window.location.hostname === 'localhost'
      ? this.translate.instant('customization.systemInfo.values.development')
      : this.translate.instant('customization.systemInfo.values.production');
  }

  /**
   * Check if localStorage is available
   */
  private isLocalStorageAvailable(): boolean {
    try {
      const test = '__test__';
      localStorage.setItem(test, test);
      localStorage.removeItem(test);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Check if sessionStorage is available
   */
  private isSessionStorageAvailable(): boolean {
    try {
      const test = '__test__';
      sessionStorage.setItem(test, test);
      sessionStorage.removeItem(test);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Get localStorage usage estimate
   */
  private getLocalStorageUsage(): string {
    try {
      let totalSize = 0;
      for (const key in localStorage) {
        if (Object.prototype.hasOwnProperty.call(localStorage, key)) {
          totalSize += localStorage[key].length + key.length;
        }
      }
      return `${(totalSize / 1024).toFixed(2)} KB`;
    } catch {
      return this.translate.instant('customization.systemInfo.values.na');
    }
  }

  /**
   * Get header template name
   */
  private getHeaderTemplateName(template: number): string {
    const names = [
      this.translate.instant('customization.layout.headerMinimal'),
      this.translate.instant('customization.layout.headerStandard'),
      this.translate.instant('customization.layout.headerFull')
    ];
    return names[template] || this.translate.instant('customization.systemInfo.values.unknown');
  }

  /**
   * Get footer template name
   */
  private getFooterTemplateName(template: number): string {
    const names = [
      this.translate.instant('customization.layout.footerMinimal'),
      this.translate.instant('customization.layout.footerStandard'),
      this.translate.instant('customization.layout.footerFull')
    ];
    return names[template] || this.translate.instant('customization.systemInfo.values.unknown');
  }

  /**
   * Get placement name
   */
  private getPlacementName(placement: number): string {
    const names = [
      this.translate.instant('customization.layout.left'),
      this.translate.instant('customization.layout.center'),
      this.translate.instant('customization.layout.right')
    ];
    return names[placement] || this.translate.instant('customization.systemInfo.values.unknown');
  }

  /**
   * Get page load time
   */
  private getPageLoadTime(): string {
    const navigationEntries = performance.getEntriesByType('navigation');
    if (navigationEntries.length > 0) {
      const timing = navigationEntries[0] as PerformanceNavigationTiming;
      const loadTime = timing.loadEventEnd - timing.startTime;
      return loadTime > 0 ? `${Math.round(loadTime)} ms` : this.translate.instant('customization.systemInfo.values.calculating');
    }
    return this.translate.instant('customization.systemInfo.values.na');
  }

  /**
   * Get DOM content loaded time
   */
  private getDOMContentLoadedTime(): string {
    const navigationEntries = performance.getEntriesByType('navigation');
    if (navigationEntries.length > 0) {
      const timing = navigationEntries[0] as PerformanceNavigationTiming;
      const domTime = timing.domContentLoadedEventEnd - timing.startTime;
      return domTime > 0 ? `${Math.round(domTime)} ms` : this.translate.instant('customization.systemInfo.values.calculating');
    }
    return this.translate.instant('customization.systemInfo.values.na');
  }

  /**
   * Format value based on type
   */
  protected formatValue(value: string | number | boolean, type?: string): string {
    if (type === 'boolean') {
      return value
        ? this.translate.instant('customization.systemInfo.values.yes')
        : this.translate.instant('customization.systemInfo.values.no');
    }
    if (type === 'date' && typeof value === 'string') {
      try {
        return new Date(value).toLocaleString();
      } catch {
        return value;
      }
    }
    return String(value);
  }

  /**
   * Get value class for styling
   */
  protected getValueClass(value: string | number | boolean, type?: string): string {
    if (type === 'boolean') {
      return value ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400';
    }
    return 'text-gray-900 dark:text-white';
  }

  /**
   * Refresh system information
   */
  protected refresh(): void {
    this.loadSystemInfo();
  }

  /**
   * Copy all info to clipboard
   */
  protected async copyToClipboard(): Promise<void> {
    try {
      const text = this.systemInfo().map(category => {
        const items = category.items.map(item =>
          `${item.label}: ${this.formatValue(item.value, item.type)}`
        ).join('\n');
        return `${category.category}\n${items}\n`;
      }).join('\n');

      await navigator.clipboard.writeText(text);
      alert(this.translate.instant('customization.systemInfo.messages.copied'));
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
      alert(this.translate.instant('customization.systemInfo.messages.copyFailed'));
    }
  }
}
