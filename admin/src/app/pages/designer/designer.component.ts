import { Component, inject } from '@angular/core';

import { Router, RouterModule } from '@angular/router';
import { AuthService } from '@cms/shared/auth/data-access';
import { TranslationService } from '@cms/shared/utils';
import {
  IconComponent,
  LanguageSelectorComponent,
  HeaderComponent,
  NavbarComponent,
  FooterComponent,
  NavItem
} from '@cms/shared/ui';

@Component({
  selector: 'cms-designer',
  imports: [
    RouterModule,
    IconComponent,
    LanguageSelectorComponent,
    HeaderComponent,
    NavbarComponent,
    FooterComponent
],
  templateUrl: './designer.component.html',
  styleUrl: './designer.component.css',
})
export class DesignerComponent {
  protected readonly authService = inject(AuthService);
  protected readonly translate = inject(TranslationService);
  private readonly router = inject(Router);

  protected readonly currentUser = this.authService.currentUser;

  protected readonly navItems: NavItem[] = [
    { label: this.translate.instant('dashboard.title'), route: '/dashboard' },
    { label: this.translate.instant('configurator.title'), route: '/configurator' },
    { label: this.translate.instant('designer.title'), route: '/designer' },
  ];

  protected onLogout(): void {
    this.authService.logout().subscribe({
      next: () => {
        this.router.navigate(['/login']);
      },
    });
  }
}