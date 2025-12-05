import { Component, inject } from '@angular/core';
import { RouterModule } from '@angular/router';

import { NxWelcome } from './nx-welcome';
import { TranslationService } from '@cms/shared/utils';
import {
  HeaderComponent,
  NavbarComponent,
  FooterComponent,
  NavItem,
  LanguageSelectorComponent
} from '@cms/shared/ui';

@Component({
  imports: [
    NxWelcome,
    RouterModule,
    HeaderComponent,
    NavbarComponent,
    FooterComponent,
    LanguageSelectorComponent
],
  selector: 'cms-root',
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  protected title = 'public';
  protected readonly translate = inject(TranslationService);

  protected readonly navItems: NavItem[] = [
    { label: 'Home', route: '/' },
    { label: 'About', route: '/about' },
    { label: 'Contact', route: '/contact' },
  ];
}
