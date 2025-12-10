import { Component, inject } from '@angular/core';

import { AuthService, TranslationService } from '@cms/shared/utils';

@Component({
  selector: 'cms-dashboard-overview',
  standalone: true,
  imports: [],
  template: `
    <div class="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
      <h2 class="text-xl font-semibold text-gray-900 dark:text-white mb-4">
        @if (currentUser(); as user) {
          {{ translate.instant('dashboard.welcome', { name: user.firstName }) }}
        }
      </h2>
      <p class="text-gray-600 dark:text-gray-300">
        {{ translate.instant('dashboard.description') }}
      </p>
    </div>
  `,
})
export class DashboardOverviewComponent {
  protected readonly authService = inject(AuthService);
  protected readonly translate = inject(TranslationService);
  protected readonly currentUser = this.authService.currentUser;
}
