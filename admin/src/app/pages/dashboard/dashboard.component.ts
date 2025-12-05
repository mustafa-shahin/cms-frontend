import { Component, inject } from '@angular/core';

import { Router } from '@angular/router';
import { AuthService } from '@cms/shared/auth/data-access';
import { TranslationService, ThemeService } from '@cms/shared/utils';
import { IconComponent, LanguageSelectorComponent } from '@cms/shared/ui';

@Component({
  selector: 'cms-dashboard',
  imports: [IconComponent, LanguageSelectorComponent],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css',
})
export class DashboardComponent {
  protected readonly authService = inject(AuthService);
  protected readonly translate = inject(TranslationService);
  protected readonly themeService = inject(ThemeService);
  private readonly router = inject(Router);

  protected readonly currentUser = this.authService.currentUser;
  protected readonly currentTheme = this.themeService.currentTheme;

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
}