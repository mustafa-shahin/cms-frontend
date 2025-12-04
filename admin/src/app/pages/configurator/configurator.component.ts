import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '@cms/shared/auth/data-access';
import { TranslationService, ThemeService } from '@cms/shared/utils';

@Component({
  selector: 'cms-configurator',
  imports: [CommonModule],
  templateUrl: './configurator.component.html',
  styleUrl: './configurator.component.css',
})
export class ConfiguratorComponent {
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
