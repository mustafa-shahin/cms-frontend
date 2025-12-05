import { Component, computed, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { StyleService, TranslationService } from '@cms/shared/utils';

export interface FooterLink {
  label: string;
  route?: string;
  href?: string;
}

export interface FooterSection {
  title: string;
  links: FooterLink[];
}

@Component({
  selector: 'cms-footer',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './footer.component.html',
})
export class FooterComponent {
  @Input() sections: FooterSection[] = [];
  @Input() copyrightText?: string;

  // Computed signal that tracks the footer background color from StyleService
  footerBackground = computed(() => this.styleService.styles().footerBackground);

  currentYear = new Date().getFullYear();

  constructor(
    private styleService: StyleService,
    public translationService: TranslationService
  ) {}
}
