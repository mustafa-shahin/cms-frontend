import { Component, Input, inject } from '@angular/core';

import { TranslationService } from '@cms/shared/utils';

@Component({
  selector: 'cms-header',
  standalone: true,
  imports: [],
  templateUrl: './header.component.html',
})
export class HeaderComponent {
  @Input() logoUrl?: string;
  @Input() logoAlt?: string;
  @Input() logoPlaceholderText?: string;

  translationService = inject(TranslationService);
}
