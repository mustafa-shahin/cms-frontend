import { Injectable, signal } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

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
    en: {},
    de: {},
    ar: {},
  };

  private currentLanguageSubject = new BehaviorSubject<Language>(
    this.getStoredLanguage()
  );
  public currentLanguage$ = this.currentLanguageSubject.asObservable();
  public currentLanguage = signal<Language>(this.getStoredLanguage());

  constructor() {
    this.loadDefaultTranslations();
  }

  /**
   * Set current language
   */
  setLanguage(language: Language): void {
    this.currentLanguageSubject.next(language);
    this.currentLanguage.set(language);
    localStorage.setItem(LANGUAGE_KEY, language);

    // Set HTML lang and dir attributes
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
      console.warn(`Translation not found for key: ${key} in language: ${language}`);
      return key;
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

  /**
   * Load default translations
   */
  private loadDefaultTranslations(): void {
    // English
    this.loadTranslations('en', {
      common: {
        login: 'Login',
        register: 'Register',
        logout: 'Logout',
        email: 'Email',
        password: 'Password',
        confirmPassword: 'Confirm Password',
        firstName: 'First Name',
        lastName: 'Last Name',
        submit: 'Submit',
        cancel: 'Cancel',
        save: 'Save',
        delete: 'Delete',
        edit: 'Edit',
        create: 'Create',
        update: 'Update',
        search: 'Search',
        loading: 'Loading...',
        error: 'Error',
        success: 'Success',
        warning: 'Warning',
        info: 'Information',
      },
      auth: {
        loginTitle: 'Sign In',
        loginSubtitle: 'Enter your credentials to access your account',
        registerTitle: 'Create Account',
        registerSubtitle: 'Fill in the information below to create your account',
        forgotPassword: 'Forgot Password?',
        noAccount: "Don't have an account?",
        haveAccount: 'Already have an account?',
        signUpLink: 'Sign Up',
        signInLink: 'Sign In',
        loginSuccess: 'Successfully logged in',
        registerSuccess: 'Account created successfully',
        logoutSuccess: 'Successfully logged out',
        loginError: 'Invalid email or password',
        registerError: 'Registration failed',
      },
      dashboard: {
        title: 'Dashboard',
        welcome: 'Welcome back, {{name}}!',
      },
      errors: {
        required: 'This field is required',
        invalidEmail: 'Please enter a valid email address',
        passwordMismatch: 'Passwords do not match',
        minLength: 'Minimum length is {{min}} characters',
        maxLength: 'Maximum length is {{max}} characters',
      },
    });

    // German
    this.loadTranslations('de', {
      common: {
        login: 'Anmelden',
        register: 'Registrieren',
        logout: 'Abmelden',
        email: 'E-Mail',
        password: 'Passwort',
        confirmPassword: 'Passwort bestätigen',
        firstName: 'Vorname',
        lastName: 'Nachname',
        submit: 'Absenden',
        cancel: 'Abbrechen',
        save: 'Speichern',
        delete: 'Löschen',
        edit: 'Bearbeiten',
        create: 'Erstellen',
        update: 'Aktualisieren',
        search: 'Suchen',
        loading: 'Wird geladen...',
        error: 'Fehler',
        success: 'Erfolg',
        warning: 'Warnung',
        info: 'Information',
      },
      auth: {
        loginTitle: 'Anmelden',
        loginSubtitle: 'Geben Sie Ihre Anmeldedaten ein',
        registerTitle: 'Konto erstellen',
        registerSubtitle: 'Füllen Sie die Informationen aus, um Ihr Konto zu erstellen',
        forgotPassword: 'Passwort vergessen?',
        noAccount: 'Noch kein Konto?',
        haveAccount: 'Bereits ein Konto?',
        signUpLink: 'Registrieren',
        signInLink: 'Anmelden',
        loginSuccess: 'Erfolgreich angemeldet',
        registerSuccess: 'Konto erfolgreich erstellt',
        logoutSuccess: 'Erfolgreich abgemeldet',
        loginError: 'Ungültige E-Mail oder Passwort',
        registerError: 'Registrierung fehlgeschlagen',
      },
      dashboard: {
        title: 'Dashboard',
        welcome: 'Willkommen zurück, {{name}}!',
      },
      errors: {
        required: 'Dieses Feld ist erforderlich',
        invalidEmail: 'Bitte geben Sie eine gültige E-Mail-Adresse ein',
        passwordMismatch: 'Passwörter stimmen nicht überein',
        minLength: 'Mindestlänge beträgt {{min}} Zeichen',
        maxLength: 'Maximale Länge beträgt {{max}} Zeichen',
      },
    });

    // Arabic
    this.loadTranslations('ar', {
      common: {
        login: 'تسجيل الدخول',
        register: 'التسجيل',
        logout: 'تسجيل الخروج',
        email: 'البريد الإلكتروني',
        password: 'كلمة المرور',
        confirmPassword: 'تأكيد كلمة المرور',
        firstName: 'الاسم الأول',
        lastName: 'اسم العائلة',
        submit: 'إرسال',
        cancel: 'إلغاء',
        save: 'حفظ',
        delete: 'حذف',
        edit: 'تعديل',
        create: 'إنشاء',
        update: 'تحديث',
        search: 'بحث',
        loading: 'جاري التحميل...',
        error: 'خطأ',
        success: 'نجاح',
        warning: 'تحذير',
        info: 'معلومات',
      },
      auth: {
        loginTitle: 'تسجيل الدخول',
        loginSubtitle: 'أدخل بيانات الاعتماد الخاصة بك',
        registerTitle: 'إنشاء حساب',
        registerSubtitle: 'املأ المعلومات أدناه لإنشاء حسابك',
        forgotPassword: 'نسيت كلمة المرور؟',
        noAccount: 'ليس لديك حساب؟',
        haveAccount: 'هل لديك حساب بالفعل؟',
        signUpLink: 'التسجيل',
        signInLink: 'تسجيل الدخول',
        loginSuccess: 'تم تسجيل الدخول بنجاح',
        registerSuccess: 'تم إنشاء الحساب بنجاح',
        logoutSuccess: 'تم تسجيل الخروج بنجاح',
        loginError: 'بريد إلكتروني أو كلمة مرور غير صحيحة',
        registerError: 'فشل التسجيل',
      },
      dashboard: {
        title: 'لوحة التحكم',
        welcome: 'مرحبًا بعودتك، {{name}}!',
      },
      errors: {
        required: 'هذا الحقل مطلوب',
        invalidEmail: 'الرجاء إدخال عنوان بريد إلكتروني صحيح',
        passwordMismatch: 'كلمات المرور غير متطابقة',
        minLength: 'الحد الأدنى للطول هو {{min}} أحرف',
        maxLength: 'الحد الأقصى للطول هو {{max}} أحرف',
      },
    });
  }
}
