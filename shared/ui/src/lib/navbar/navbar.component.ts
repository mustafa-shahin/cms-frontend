import { Component, computed, Input, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { StyleService, TranslationService } from '@cms/shared/utils';

export interface NavItem {
  label: string;
  route: string;
  icon?: string;
}

@Component({
  selector: 'cms-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './navbar.component.html',
})
export class NavbarComponent implements OnInit {
  @Input() items: NavItem[] = [];

  private styleService = inject(StyleService);
  public translationService = inject(TranslationService);

  // Computed signal that tracks the navbar background color from StyleService
  navbarBackground = computed(() => this.styleService.styles().navbarBackground);

  ngOnInit(): void {
    console.log(this.navbarBackground());
  }
}
