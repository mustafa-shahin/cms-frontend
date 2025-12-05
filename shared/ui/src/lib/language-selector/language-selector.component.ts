import { Component, inject, signal } from '@angular/core';

import { IconComponent } from '../icon/icon.component';
import { TranslationService, Language } from '@cms/shared/utils';

interface LanguageOption {
  code: Language;
  name: string;
  nativeName: string;
  flag: string;
}

@Component({
  selector: 'cms-language-selector',
  standalone: true,
  imports: [IconComponent],
  template: `
    <div class="relative">
      <button
        type="button"
        (click)="toggleDropdown()"
        class="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
      >
        <span class="text-base">{{ getCurrentLanguage().flag }}</span>
        <span class="hidden sm:inline">{{ getCurrentLanguage().nativeName }}</span>
        <cms-icon name="chevron-down" size="xs"></cms-icon>
      </button>

      @if (isOpen()) {
        <div
          class="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg z-50"
        >
          <div class="py-1">
            @for (lang of languages; track lang.code) {
              <button
                type="button"
                (click)="selectLanguage(lang.code)"
                class="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                [class.bg-blue-50]="lang.code === currentLanguage()"
                [class.dark:bg-blue-900/20]="lang.code === currentLanguage()"
              >
                <span class="text-base">{{ lang.flag }}</span>
                <span>{{ lang.nativeName }}</span>
                @if (lang.code === currentLanguage()) {
                  <cms-icon name="check" size="sm" class="ml-auto text-blue-600 dark:text-blue-400"></cms-icon>
                }
              </button>
            }
          </div>
        </div>
      }
    </div>

    <!-- Backdrop to close dropdown when clicking outside -->
@if (isOpen()) {
  <button
    type="button"
    aria-label="Close language selector"
    class="fixed inset-0 z-40"
    (click)="closeDropdown()"
    (keydown.escape)="closeDropdown()"
  ></button>
}
  `,
  styles: [
    `
      :host {
        display: inline-block;
      }
    `,
  ],
})
export class LanguageSelectorComponent {
  private readonly translationService = inject(TranslationService);

  protected isOpen = signal(false);
  protected currentLanguage = this.translationService.currentLanguage;

  protected readonly languages: LanguageOption[] = [
    { code: 'en', name: 'English', nativeName: 'English', flag: '🇬🇧' },
    { code: 'de', name: 'German', nativeName: 'Deutsch', flag: '🇩🇪' },
    { code: 'ar', name: 'Arabic', nativeName: 'العربية', flag: '🇸🇦' },
  ];

  protected getCurrentLanguage(): LanguageOption {
    return (
      this.languages.find((l) => l.code === this.currentLanguage()) ||
      this.languages[0]
    );
  }

  protected toggleDropdown(): void {
    this.isOpen.set(!this.isOpen());
  }

  protected closeDropdown(): void {
    this.isOpen.set(false);
  }

  protected selectLanguage(code: Language): void {
    this.translationService.setLanguage(code);
    this.closeDropdown();
  }
}