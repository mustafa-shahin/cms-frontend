import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '@cms/shared/auth/data-access';
import { TranslationService, ThemeService, StyleService, StylesApiService, AppStyles } from '@cms/shared/utils';
import { IconComponent, LanguageSelectorComponent } from '@cms/shared/ui';

@Component({
  selector: 'cms-configurator',
  imports: [CommonModule, FormsModule, IconComponent, LanguageSelectorComponent],
  templateUrl: './configurator.component.html',
  styleUrl: './configurator.component.css',
})
export class ConfiguratorComponent implements OnInit {
  protected readonly authService = inject(AuthService);
  protected readonly translate = inject(TranslationService);
  protected readonly themeService = inject(ThemeService);
  protected readonly styleService = inject(StyleService);
  private readonly stylesApiService = inject(StylesApiService);
  private readonly router = inject(Router);

  protected readonly currentUser = this.authService.currentUser;
  protected readonly currentTheme = this.themeService.currentTheme;
  protected readonly currentStyles = this.styleService.styles;

  // Local state for color inputs
  // Brand colors
  protected primaryColor = signal(this.styleService.getPrimaryColor());
  protected secondaryColor = signal(this.styleService.getSecondaryColor());

  // Layout backgrounds
  protected navbarBackground = signal(this.styleService.getNavbarBackground());
  protected footerBackground = signal(this.styleService.getFooterBackground());

  // Text colors
  protected textColor = signal(this.styleService.getStyles().textColor);
  protected headingColor = signal(this.styleService.getStyles().headingColor);

  // Link colors
  protected linkColor = signal(this.styleService.getStyles().linkColor);
  protected linkHoverColor = signal(this.styleService.getStyles().linkHoverColor);
  protected linkVisitedColor = signal(this.styleService.getStyles().linkVisitedColor);

  // State colors
  protected successColor = signal(this.styleService.getSuccessColor());
  protected warningColor = signal(this.styleService.getWarningColor());
  protected errorColor = signal(this.styleService.getErrorColor());

  protected saveMessage = signal<{ type: 'success' | 'error'; text: string } | null>(null);
  protected isLoading = signal(false);

  /**
   * Apply color changes in real-time for preview
   */
  protected applyPreview(): void {
    const previewStyles: AppStyles = {
      primaryColor: this.primaryColor(),
      secondaryColor: this.secondaryColor(),
      navbarBackground: this.navbarBackground(),
      footerBackground: this.footerBackground(),
      textColor: this.textColor(),
      headingColor: this.headingColor(),
      linkColor: this.linkColor(),
      linkHoverColor: this.linkHoverColor(),
      linkVisitedColor: this.linkVisitedColor(),
      successColor: this.successColor(),
      warningColor: this.warningColor(),
      errorColor: this.errorColor(),
    };
    this.styleService.setStyles(previewStyles);
  }

  ngOnInit(): void {
    this.loadStylesFromServer();
  }

  protected onLogout(): void {
    this.authService.logout().subscribe({
      next: () => {
        this.router.navigate(['/login']);
      },
    });
  }

  protected toggleTheme(): void {
    this.themeService.toggleTheme();
  }

  /**
   * Load styles from server on component initialization
   */
  private loadStylesFromServer(): void {
    this.isLoading.set(true);
    this.stylesApiService.getStyleSettings().subscribe({
      next: (response) => {
        const styles = this.stylesApiService.toAppStyles(response);
        this.styleService.setStyles(styles);
        this.updateLocalColors(styles);
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Failed to load styles from server:', error);
        this.isLoading.set(false);
        // Keep using local/default styles if server fails
      }
    });
  }

  /**
   * Update local color signals from styles
   */
  private updateLocalColors(styles: AppStyles): void {
    // Brand colors
    this.primaryColor.set(styles.primaryColor);
    this.secondaryColor.set(styles.secondaryColor);

    // Layout backgrounds
    this.navbarBackground.set(styles.navbarBackground);
    this.footerBackground.set(styles.footerBackground);

    // Text colors
    this.textColor.set(styles.textColor);
    this.headingColor.set(styles.headingColor);

    // Link colors
    this.linkColor.set(styles.linkColor);
    this.linkHoverColor.set(styles.linkHoverColor);
    this.linkVisitedColor.set(styles.linkVisitedColor);

    // State colors
    this.successColor.set(styles.successColor);
    this.warningColor.set(styles.warningColor);
    this.errorColor.set(styles.errorColor);

    // Apply the preview after all colors are set
    this.applyPreview();
  }

  /**
   * Save styles to server and apply locally
   */
  protected onSaveStyles(): void {
    this.isLoading.set(true);

    const stylesRequest = {
      primaryColor: this.primaryColor(),
      secondaryColor: this.secondaryColor(),
      navbarBackground: this.navbarBackground(),
      footerBackground: this.footerBackground(),
      textColor: this.textColor(),
      headingColor: this.headingColor(),
      linkColor: this.linkColor(),
      linkHoverColor: this.linkHoverColor(),
      linkVisitedColor: this.linkVisitedColor(),
      successColor: this.successColor(),
      warningColor: this.warningColor(),
      errorColor: this.errorColor(),
    };

    this.stylesApiService.updateStyleSettings(stylesRequest).subscribe({
      next: (response) => {
        const styles = this.stylesApiService.toAppStyles(response);
        this.styleService.setStyles(styles);
        this.showMessage('success', this.translate.instant('styleSettings.saveSuccess'));
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Failed to save styles:', error);
        this.showMessage('error', this.translate.instant('styleSettings.saveError'));
        this.isLoading.set(false);
      }
    });
  }

  /**
   * Reset styles to defaults
   */
  protected onResetStyles(): void {
    this.styleService.resetStyles();
    this.updateLocalColors(this.styleService.getStyles());
    this.showMessage('success', 'Styles reset to defaults');
  }

  private showMessage(type: 'success' | 'error', text: string): void {
    this.saveMessage.set({ type, text });
    setTimeout(() => {
      this.saveMessage.set(null);
    }, 3000);
  }
}