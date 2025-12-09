import { Component, input, signal } from '@angular/core';

import { FormsModule } from '@angular/forms';

export interface NavItem {
  label: string;
  href: string;
  children?: NavItem[];
  icon?: string;
  description?: string;
}

/**
 * Full-featured header template - everything including mega menu, search, user account.
 * Most feature-rich header option.
 */
@Component({
  selector: 'app-header-full',
  standalone: true,
  imports: [FormsModule],
  template: `
    <!-- Top Bar (optional announcements, language selector, etc.) -->
    @if (showTopBar()) {
      <div class="bg-gray-50 border-b text-sm">
        <div class="mx-auto px-4 sm:px-6 lg:px-8" [style.max-width.px]="maxWidth()">
          <div class="flex h-10 items-center justify-between">
            <div class="text-gray-600">
              {{ topBarMessage() }}
            </div>
            <div class="flex items-center gap-4">
              <a href="/contact" class="text-gray-600 hover:text-gray-900">Contact</a>
              <a href="/help" class="text-gray-600 hover:text-gray-900">Help</a>
            </div>
          </div>
        </div>
      </div>
    }

    <!-- Main Header -->
    <header class="bg-white border-b" [class.sticky]="isSticky()" [class.top-0]="isSticky()" [class.z-50]="isSticky()">
      <div class="mx-auto px-4 sm:px-6 lg:px-8" [style.max-width.px]="maxWidth()">
        <div class="flex h-20 items-center justify-between">
          <!-- Logo Section -->
          <div class="flex items-center gap-3">
            @if (logoUrl()) {
              <img [src]="logoUrl()" [alt]="logoAlt()" class="h-12" [style.max-height.px]="maxLogoHeight()" />
            }
            @if (showSiteName()) {
              <div>
                <div class="text-xl font-bold">{{ siteName() }}</div>
                @if (tagline()) {
                  <div class="text-xs text-gray-500">{{ tagline() }}</div>
                }
              </div>
            }
          </div>

          <!-- Center Navigation (Desktop) -->
          <nav class="hidden lg:flex items-center gap-8">
            @for (item of navItems(); track item.href) {
              @if (item.children && item.children.length > 0) {
                <!-- Dropdown Menu -->
                <div class="relative group">
                  <button
                    type="button"
                    class="flex items-center gap-1 text-gray-700 hover:text-gray-900 transition-colors py-2"
                  >
                    {{ item.label }}
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  <!-- Mega Menu Dropdown -->
                  <div class="absolute left-0 mt-2 w-64 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 bg-white border rounded-lg shadow-lg">
                    <div class="p-4">
                      @for (child of item.children; track child.href) {
                        <a [href]="child.href" class="block px-3 py-2 rounded-md hover:bg-gray-50">
                          <div class="font-medium text-gray-900">{{ child.label }}</div>
                          @if (child.description) {
                            <div class="text-sm text-gray-500">{{ child.description }}</div>
                          }
                        </a>
                      }
                    </div>
                  </div>
                </div>
              } @else {
                <!-- Simple Link -->
                <a [href]="item.href" class="text-gray-700 hover:text-gray-900 transition-colors">
                  {{ item.label }}
                </a>
              }
            }
          </nav>

          <!-- Right Actions -->
          <div class="flex items-center gap-4">
            <!-- Search -->
            @if (showSearch()) {
              <div class="relative hidden md:block">
                <div class="flex items-center">
                  <input
                    type="search"
                    [(ngModel)]="searchQuery"
                    (keyup.enter)="onSearch()"
                    [placeholder]="searchPlaceholder()"
                    class="px-4 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-56"
                  />
                  <button
                    type="button"
                    (click)="onSearch()"
                    class="absolute right-2 p-1 text-gray-400 hover:text-gray-600"
                  >
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </button>
                </div>
              </div>
            }

            <!-- User Account -->
            @if (showUserAccount()) {
              <div class="hidden md:flex items-center gap-2">
                <button type="button" class="px-4 py-2 text-gray-700 hover:text-gray-900">
                  Sign In
                </button>
                <button type="button" class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                  Sign Up
                </button>
              </div>
            }

            <!-- Mobile menu button -->
            <button
              type="button"
              (click)="toggleMobileMenu()"
              class="lg:hidden p-2 rounded-md hover:bg-gray-100"
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
          <div class="lg:hidden border-t py-4">
            <!-- Mobile Search -->
            @if (showSearch()) {
              <div class="px-2 pb-4">
                <input
                  type="search"
                  [(ngModel)]="searchQuery"
                  (keyup.enter)="onSearch()"
                  [placeholder]="searchPlaceholder()"
                  class="w-full px-4 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            }

            <!-- Mobile Navigation -->
            <nav class="flex flex-col">
              @for (item of navItems(); track item.href) {
                <div>
                  @if (item.children && item.children.length > 0) {
                    <button
                      type="button"
                      (click)="toggleMobileSubmenu(item.label)"
                      class="w-full flex items-center justify-between px-2 py-2 text-gray-700 hover:bg-gray-100 rounded-md"
                    >
                      <span>{{ item.label }}</span>
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    @if (mobileSubmenuOpen() === item.label) {
                      <div class="pl-4">
                        @for (child of item.children; track child.href) {
                          <a [href]="child.href" class="block px-2 py-2 text-gray-600 hover:bg-gray-50 rounded-md">
                            {{ child.label }}
                          </a>
                        }
                      </div>
                    }
                  } @else {
                    <a [href]="item.href" class="block px-2 py-2 text-gray-700 hover:bg-gray-100 rounded-md">
                      {{ item.label }}
                    </a>
                  }
                </div>
              }
            </nav>

            <!-- Mobile User Account -->
            @if (showUserAccount()) {
              <div class="flex flex-col gap-2 px-2 pt-4 border-t mt-4">
                <button type="button" class="w-full px-4 py-2 text-gray-700 border rounded-md hover:bg-gray-50">
                  Sign In
                </button>
                <button type="button" class="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                  Sign Up
                </button>
              </div>
            }
          </div>
        }
      </div>
    </header>
  `,
})
export class HeaderFullComponent {
  // Configuration inputs
  logoUrl = input<string | null>(null);
  logoAlt = input<string>('Logo');
  siteName = input<string>('My Site');
  tagline = input<string | null>(null);
  showSiteName = input<boolean>(true);
  maxLogoHeight = input<number>(64);
  showSearch = input<boolean>(true);
  searchPlaceholder = input<string>('Search...');
  showUserAccount = input<boolean>(true);
  showTopBar = input<boolean>(true);
  topBarMessage = input<string>('Welcome to our site!');
  isSticky = input<boolean>(true);
  maxWidth = input<number>(1280);
  navItems = input<NavItem[]>([]);

  // Component state
  searchQuery = signal('');
  mobileMenuOpen = signal(false);
  mobileSubmenuOpen = signal<string | null>(null);

  toggleMobileMenu(): void {
    this.mobileMenuOpen.update(value => !value);
    if (!this.mobileMenuOpen()) {
      this.mobileSubmenuOpen.set(null);
    }
  }

  toggleMobileSubmenu(label: string): void {
    this.mobileSubmenuOpen.update(current => current === label ? null : label);
  }

  onSearch(): void {
    const query = this.searchQuery();
    if (query.trim()) {
      console.log('Searching for:', query);
      // In production, emit event or use router
    }
  }
}
