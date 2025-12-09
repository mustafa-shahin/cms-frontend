import { Component, inject } from '@angular/core';

import { RouterLink, RouterLinkActive } from '@angular/router';
import { TranslationService } from '@cms/shared/utils';
import { IconComponent } from '@cms/shared/ui';

@Component({
  selector: 'cms-sidebar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, IconComponent],
  templateUrl: './sidebar.component.html',
})
export class SidebarComponent {
  protected readonly translate = inject(TranslationService);
}
