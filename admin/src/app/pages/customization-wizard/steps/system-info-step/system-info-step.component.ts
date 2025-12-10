import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslationService, CustomizationStateService, AuthService } from '@cms/shared/utils';
import { ButtonComponent, IconComponent } from '@cms/shared/ui';

interface SystemInfo {
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
        category: 'Application Information',
        items: [
          { label: 'Application Name', value: 'CMS Frontend', type: 'text' },
          { label: 'Version', value: '1.0.0', type: 'text' },
          { label: 'Environment', value: this.getEnvironment(), type: 'text' },
          { label: 'Build Date', value: new Date().toISOString(), type: 'date' }
        ]
      },
      {
        category: 'User Information',
        items: [
          { label: 'User ID', value: currentUser?.id || 'N/A', type: 'text' },
          { label: 'Username', value: currentUser?.fullName || 'N/A', type: 'text' },
          { label: 'Email', value: currentUser?.email || 'N/A', type: 'text' },
          { label: 'Role', value: currentUser?.role || 'N/A', type: 'text' },
          { label: 'Authenticated', value: !!currentUser, type: 'boolean' }
        ]
      },
      {
        category: 'Configuration Status',
        items: [
          { label: 'Theme Configured', value: !!theme, type: 'boolean' },
          { label: 'Typography Configured', value: !!typography, type: 'boolean' },
          { label: 'Layout Configured', value: !!layout, type: 'boolean' },
          { label: 'Has Unsaved Changes', value: this.customizationState.hasUnsavedChanges(), type: 'boolean' },
          { label: 'Theme Last Modified', value: theme?.lastModifiedAt || 'Never', type: 'text' },
          { label: 'Typography Last Modified', value: typography?.lastModifiedAt || 'Never', type: 'text' },
          { label: 'Layout Last Modified', value: layout?.lastModifiedAt || 'Never', type: 'text' }
        ]
      },
      {
        category: 'Theme Configuration',
        items: theme ? [
          { label: 'Brand Primary Color', value: theme.brandPalette.primary.base, type: 'text' },
          { label: 'Brand Secondary Color', value: theme.brandPalette.secondary.base, type: 'text' },
          { label: 'Brand Accent Color', value: theme.brandPalette.accent.base, type: 'text' },
          { label: 'Last Modified By', value: theme.lastModifiedBy || 'System', type: 'text' }
        ] : [
          { label: 'Status', value: 'Not Configured', type: 'text' }
        ]
      },
      {
        category: 'Typography Configuration',
        items: typography ? [
          { label: 'Primary Font Family', value: typography.primaryFontFamily, type: 'text' },
          { label: 'Secondary Font Family', value: typography.secondaryFontFamily, type: 'text' },
          { label: 'Mono Font Family', value: typography.monoFontFamily, type: 'text' },
          { label: 'Text Styles Count', value: Object.keys(typography.textStyles).length, type: 'number' },
          { label: 'Last Modified By', value: typography.lastModifiedBy || 'System', type: 'text' }
        ] : [
          { label: 'Status', value: 'Not Configured', type: 'text' }
        ]
      },
      {
        category: 'Layout Configuration',
        items: layout ? [
          { label: 'Header Template', value: this.getHeaderTemplateName(layout.headerConfiguration.template), type: 'text' },
          { label: 'Header Logo Placement', value: this.getPlacementName(layout.headerConfiguration.logoPlacement), type: 'text' },
          { label: 'Header Show Search', value: layout.headerConfiguration.showSearch, type: 'boolean' },
          { label: 'Header Sticky', value: layout.headerConfiguration.stickyHeader, type: 'boolean' },
          { label: 'Footer Template', value: this.getFooterTemplateName(layout.footerConfiguration.template), type: 'text' },
          { label: 'Footer Columns', value: layout.footerConfiguration.columnCount, type: 'number' },
          { label: 'Footer Show Social Links', value: layout.footerConfiguration.showSocialLinks, type: 'boolean' },
          { label: 'Footer Show Newsletter', value: layout.footerConfiguration.showNewsletter, type: 'boolean' },
          { label: 'Container Max Width', value: `${layout.spacing.containerMaxWidth}px`, type: 'text' },
          { label: 'Section Padding', value: `${layout.spacing.sectionPadding}rem`, type: 'text' },
          { label: 'Component Gap', value: `${layout.spacing.componentGap}rem`, type: 'text' },
          { label: 'Last Modified By', value: layout.lastModifiedBy || 'System', type: 'text' }
        ] : [
          { label: 'Status', value: 'Not Configured', type: 'text' }
        ]
      },
      {
        category: 'Browser Information',
        items: [
          { label: 'User Agent', value: navigator.userAgent, type: 'text' },
          { label: 'Platform', value: navigator.platform, type: 'text' },
          { label: 'Language', value: navigator.language, type: 'text' },
          { label: 'Online', value: navigator.onLine, type: 'boolean' },
          { label: 'Cookies Enabled', value: navigator.cookieEnabled, type: 'boolean' }
        ]
      },
      {
        category: 'Storage Information',
        items: [
          { label: 'localStorage Available', value: this.isLocalStorageAvailable(), type: 'boolean' },
          { label: 'localStorage Usage', value: this.getLocalStorageUsage(), type: 'text' },
          { label: 'sessionStorage Available', value: this.isSessionStorageAvailable(), type: 'boolean' }
        ]
      },
      {
        category: 'Performance Metrics',
        items: [
          { label: 'Page Load Time', value: this.getPageLoadTime(), type: 'text' },
          { label: 'DOM Content Loaded', value: this.getDOMContentLoadedTime(), type: 'text' },
          { label: 'Window Width', value: `${window.innerWidth}px`, type: 'text' },
          { label: 'Window Height', value: `${window.innerHeight}px`, type: 'text' },
          { label: 'Device Pixel Ratio', value: window.devicePixelRatio, type: 'number' }
        ]
      }
    ];

    this.systemInfo.set(info);
  }

  /**
   * Get environment (production, development, etc.)
   */
  private getEnvironment(): string {
    return window.location.hostname === 'localhost' ? 'Development' : 'Production';
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
      return 'N/A';
    }
  }

  /**
   * Get header template name
   */
  private getHeaderTemplateName(template: number): string {
    const names = ['Minimal', 'Standard', 'Full'];
    return names[template] || 'Unknown';
  }

  /**
   * Get footer template name
   */
  private getFooterTemplateName(template: number): string {
    const names = ['Minimal', 'Standard', 'Full'];
    return names[template] || 'Unknown';
  }

  /**
   * Get placement name
   */
  private getPlacementName(placement: number): string {
    const names = ['Left', 'Center', 'Right'];
    return names[placement] || 'Unknown';
  }

  /**
   * Get page load time
   */
  private getPageLoadTime(): string {
    if (performance && performance.timing) {
      const loadTime = performance.timing.loadEventEnd - performance.timing.navigationStart;
      return loadTime > 0 ? `${loadTime} ms` : 'Calculating...';
    }
    return 'N/A';
  }

  /**
   * Get DOM content loaded time
   */
  private getDOMContentLoadedTime(): string {
    if (performance && performance.timing) {
      const domTime = performance.timing.domContentLoadedEventEnd - performance.timing.navigationStart;
      return domTime > 0 ? `${domTime} ms` : 'Calculating...';
    }
    return 'N/A';
  }

  /**
   * Format value based on type
   */
  protected formatValue(value: string | number | boolean, type?: string): string {
    if (type === 'boolean') {
      return value ? 'Yes' : 'No';
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
      alert('System information copied to clipboard!');
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
      alert('Failed to copy to clipboard');
    }
  }
}
