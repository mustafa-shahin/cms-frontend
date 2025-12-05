import { Component, inject, signal } from '@angular/core';

import { FormBuilder, ReactiveFormsModule, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '@cms/shared/auth/data-access';
import { TranslationService } from '@cms/shared/utils';
import { IconComponent } from '@cms/shared/ui';

@Component({
  selector: 'cms-register',
  imports: [ReactiveFormsModule, RouterLink, IconComponent],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css',
})
export class RegisterComponent {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  protected readonly translate = inject(TranslationService);

  protected isLoading = signal(false);
  protected error = signal<string | null>(null);
  protected showPassword = signal(false);
  protected showConfirmPassword = signal(false);

  protected registerForm = this.fb.group(
    {
      firstName: ['', [Validators.required, Validators.minLength(2)]],
      lastName: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', [Validators.required]],
    },
    {
      validators: this.passwordMatchValidator,
    }
  );

  private passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    const password = control.get('password');
    const confirmPassword = control.get('confirmPassword');

    if (!password || !confirmPassword) {
      return null;
    }

    return password.value === confirmPassword.value ? null : { passwordMismatch: true };
  }

  protected onSubmit(): void {
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);
    this.error.set(null);

    const { firstName, lastName, email, password, confirmPassword } = this.registerForm.value;

    this.authService
      .register({
        firstName: firstName!,
        lastName: lastName!,
        email: email!,
        password: password!,
        confirmPassword: confirmPassword!,
      })
      .subscribe({
        next: () => {
          this.isLoading.set(false);
          this.router.navigate(['/dashboard']);
        },
        error: (err) => {
          this.isLoading.set(false);
          this.error.set(err.message || this.translate.instant('auth.registerError'));
        },
      });
  }

  protected togglePasswordVisibility(field: 'password' | 'confirmPassword'): void {
    if (field === 'password') {
      this.showPassword.set(!this.showPassword());
    } else {
      this.showConfirmPassword.set(!this.showConfirmPassword());
    }
  }

  protected getFieldError(fieldName: string): string | null {
    const field = this.registerForm.get(fieldName);
    if (!field || !field.touched || !field.errors) {
      return null;
    }

    if (field.errors['required']) {
      return this.translate.instant('errors.required');
    }
    if (field.errors['email']) {
      return this.translate.instant('errors.invalidEmail');
    }
    if (field.errors['minlength']) {
      return this.translate.instant('errors.minLength', {
        min: field.errors['minlength'].requiredLength.toString(),
      });
    }

    return null;
  }

  protected getFormError(): string | null {
    if (this.registerForm.errors?.['passwordMismatch'] && this.registerForm.get('confirmPassword')?.touched) {
      return this.translate.instant('errors.passwordMismatch');
    }
    return null;
  }
}