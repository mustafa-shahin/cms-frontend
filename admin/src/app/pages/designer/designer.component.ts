import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '@cms/shared/auth/data-access';
import { TranslationService } from '@cms/shared/utils';

@Component({
  selector: 'cms-designer',
  imports: [CommonModule],
  templateUrl: './designer.component.html',
  styleUrl: './designer.component.css',
})
export class DesignerComponent {
  protected readonly authService = inject(AuthService);
  protected readonly translate = inject(TranslationService);
  private readonly router = inject(Router);

  protected readonly currentUser = this.authService.currentUser;

  protected onLogout(): void {
    this.authService.logout().subscribe({
      next: () => {
        this.router.navigate(['/login']);
      },
    });
  }
}
