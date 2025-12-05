import { Injectable, signal } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import translationsEn from '../translations/en.json';
import translationsDe from '../translations/de.json';
import translationsAr from '../translations/ar.json';

export type Language = 'en' | 'de' | 'ar';

interface Translations {
  [key: string]: string | Translations;
}

const LANGUAGE_KEY = 'cms_language';

@Injectable({
  providedIn: 'root',
})
export class TranslationService {
  private translations: Record<Language, Translations> = {
    en: translationsEn,
    de: translationsDe,
    ar: translationsAr,
  };

  private currentLanguageSubject = new BehaviorSubject<Language>(
    this.getStoredLanguage()
  );
  public currentLanguage$ = this.currentLanguageSubject.asObservable();
  public currentLanguage = signal<Language>(this.getStoredLanguage());

  constructor() {
    // Set initial HTML attributes
    this.applyLanguageAttributes(this.getStoredLanguage());
  }

  /**
   * Set current language
   */
  setLanguage(language: Language): void {
    this.currentLanguageSubject.next(language);
    this.currentLanguage.set(language);
    localStorage.setItem(LANGUAGE_KEY, language);
    this.applyLanguageAttributes(language);
  }

  /**
   * Apply language attributes to HTML element
   */
  private applyLanguageAttributes(language: Language): void {
    document.documentElement.lang = language;
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
  }

  /**
   * Get current language
   */
  getLanguage(): Language {
    return this.currentLanguage();
  }

  /**
   * Translate a key
   */
  translate(key: string, params?: Record<string, string>): string {
    const language = this.getLanguage();
    let translation = this.getNestedTranslation(
      this.translations[language],
      key
    );

    if (!translation) {
      // Fallback to English if translation not found
      translation = this.getNestedTranslation(this.translations['en'], key);
      if (!translation) {
        console.warn(`Translation not found for key: ${key} in language: ${language}`);
        return key;
      }
    }

    // Replace parameters
    if (params) {
      Object.keys(params).forEach((param) => {
        translation = translation.replace(`{{${param}}}`, params[param]);
      });
    }

    return translation;
  }

  /**
   * Get instant translation (alias for translate)
   */
  instant(key: string, params?: Record<string, string>): string {
    return this.translate(key, params);
  }

  /**
   * Load translations for a language
   */
  loadTranslations(language: Language, translations: Translations): void {
    this.translations[language] = {
      ...this.translations[language],
      ...translations,
    };
  }

  /**
   * Get stored language from localStorage
   */
  private getStoredLanguage(): Language {
    const stored = localStorage.getItem(LANGUAGE_KEY);
    if (stored && this.isValidLanguage(stored)) {
      return stored as Language;
    }

    // Detect browser language
    const browserLang = navigator.language.split('-')[0];
    if (this.isValidLanguage(browserLang)) {
      return browserLang as Language;
    }

    return 'en'; // Default language
  }

  /**
   * Check if language is valid
   */
  private isValidLanguage(lang: string): boolean {
    return ['en', 'de', 'ar'].includes(lang);
  }

  /**
   * Get nested translation
   */
  private getNestedTranslation(
    obj: Translations,
    key: string
  ): string {
    const keys = key.split('.');
    let current: any = obj;

    for (const k of keys) {
      if (current[k] === undefined) {
        return '';
      }
      current = current[k];
    }

    return typeof current === 'string' ? current : '';
  }

}