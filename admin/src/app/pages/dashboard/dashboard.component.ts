import { Component, inject } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { AuthService, TranslationService, ThemeService } from '@cms/shared/utils';
import { IconComponent, LanguageSelectorComponent } from '@cms/shared/ui';
import { SidebarComponent } from '../../components/sidebar/sidebar.component';

@Component({
  selector: 'cms-dashboard',
  standalone: true,
  imports: [RouterOutlet, IconComponent, LanguageSelectorComponent, SidebarComponent],
  templateUrl: './dashboard.component.html',
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