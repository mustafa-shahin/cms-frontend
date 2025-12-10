import { Component, input, signal } from '@angular/core';

import { FormsModule } from '@angular/forms';

export interface NavItem {
  label: string;
  href: string;
  children?: NavItem[];
}

/**
 * Standard header template - logo, navigation, and optional search.
 * Most commonly used header style.
 */
@Component({
  selector: 'app-header-standard',
  standalone: true,
  imports: [FormsModule],
  template: `
    <header class="border-b" [class.sticky]="isSticky()" [class.top-0]="isSticky()" [class.z-50]="isSticky()" [class.bg-white]="isSticky()">
      <div class="mx-auto px-4 sm:px-6 lg:px-8" [style.max-width.px]="maxWidth()">
        <div class="flex h-16 items-center justify-between">
          <!-- Logo Section -->
          <div class="flex items-center gap-2">
            @if (logoUrl()) {
              <img [src]="logoUrl()" [alt]="logoAlt()" class="h-10" [style.max-height.px]="maxLogoHeight()" />
            }
            @if (showSiteName()) {
              <span class="text-xl font-semibold">{{ siteName() }}</span>
            }
          </div>

          <!-- Navigation -->
          <nav class="hidden md:flex items-center gap-6">
            @for (item of navItems(); track item.href) {
              <a [href]="item.href" class="text-gray-700 hover:text-gray-900 transition-colors">
                {{ item.label }}
              </a>
            }
          </nav>

          <!-- Search and Actions -->
          <div class="flex items-center gap-4">
            @if (showSearch()) {
              <div class="relative">
                <input
                  type="search"
                  [(ngModel)]="searchQuery"
                  (keyup.enter)="onSearch()"
                  placeholder="Search..."
                  class="px-3 py-1.5 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-48"
                />
              </div>
            }

            <!-- Mobile menu button -->
            <button
              type="button"
              (click)="toggleMobileMenu()"
              class="md:hidden p-2 rounded-md hover:bg-gray-100"
              aria-label="Toggle menu"
            >
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                @if (mobileMenuOpen()) {
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                } @else {
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
                }
              </svg>
            </button>
          </div>
        </div>

        <!-- Mobile Menu -->
        @if (mobileMenuOpen()) {
          <div class="md:hidden border-t py-4">
            <nav class="flex flex-col gap-2">
              @for (item of navItems(); track item.href) {
                <a [href]="item.href" class="px-2 py-2 text-gray-700 hover:bg-gray-100 rounded-md">
                  {{ item.label }}
                </a>
              }
            </nav>
          </div>
        }
      </div>
    </header>
  `,
})
export class HeaderStandardComponent {
  // Configuration inputs
  logoUrl = input<string | null>(null);
  logoAlt = input<string>('Logo');
  siteName = input<string>('My Site');
  showSiteName = input<boolean>(true);
  maxLogoHeight = input<number>(48);
  showSearch = input<boolean>(true);
  isSticky = input<boolean>(true);
  maxWidth = input<number>(1280);
  navItems = input<NavItem[]>([]);

  // Component state
  searchQuery = signal('');
  mobileMenuOpen = signal(false);

  toggleMobileMenu(): void {
    this.mobileMenuOpen.update(value => !value);
  }

  onSearch(): void {
    const query = this.searchQuery();
    if (query.trim()) {
      // Emit search event or navigate to search page
      console.log('Searching for:', query);
      // In production, you would emit an event or use a router
    }
  }
}
