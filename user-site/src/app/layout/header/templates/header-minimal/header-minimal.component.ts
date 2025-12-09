import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';

/**
 * Minimal header template - simple logo and navigation.
 * No search, minimal features.
 */
@Component({
  selector: 'app-header-minimal',
  standalone: true,
  imports: [CommonModule],
  template: `
    <header class="border-b" [class.sticky]="isSticky()" [class.top-0]="isSticky()" [class.z-50]="isSticky()" [class.bg-white]="isSticky()">
      <div class="mx-auto px-4 sm:px-6 lg:px-8" [style.max-width.px]="maxWidth()">
        <div class="flex h-16 items-center" [ngClass]="{
          'justify-start': logoPlacement() === 'left',
          'justify-center': logoPlacement() === 'center',
          'justify-end': logoPlacement() === 'right'
        }">
          <!-- Logo Section -->
          <div class="flex items-center gap-2">
            @if (logoUrl()) {
              <img [src]="logoUrl()" [alt]="logoAlt()" class="h-10" [style.max-height.px]="maxLogoHeight()" />
            }
            @if (showSiteName()) {
              <span class="text-xl font-semibold">{{ siteName() }}</span>
            }
          </div>
        </div>
      </div>
    </header>
  `,
})
export class HeaderMinimalComponent {
  // Inputs for configuration
  logoUrl = input<string | null>(null);
  logoAlt = input<string>('Logo');
  siteName = input<string>('My Site');
  showSiteName = input<boolean>(true);
  maxLogoHeight = input<number>(48);
  logoPlacement = input<'left' | 'center' | 'right'>('left');
  isSticky = input<boolean>(false);
  maxWidth = input<number>(1280);
}
