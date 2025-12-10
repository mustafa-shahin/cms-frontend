import { Component, EventEmitter, Input, OnInit, Output, inject, OnChanges } from '@angular/core';

import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { UserService, TranslationService, ToasterService } from '@cms/shared/utils';
import { InputComponent } from '@cms/shared/ui';
import { UserListDto, UserRole, CreateUserDto, UpdateUserDto } from '@cms/shared/api-interfaces';

@Component({
  selector: 'cms-user-form',
  standalone: true,
  imports: [ReactiveFormsModule, InputComponent],
  templateUrl: './user-form.component.html',
})
export class UserFormComponent implements OnInit, OnChanges {
  @Input() user: UserListDto | null = null;
  @Output() cancelled = new EventEmitter<void>();
  @Output() saved = new EventEmitter<void>();

  protected readonly translate = inject(TranslationService);
  private readonly fb = inject(FormBuilder);
  private readonly userService = inject(UserService);
  private readonly toaster = inject(ToasterService);

  form!: FormGroup;
  isSubmitting = false;
  UserRole = UserRole;

  ngOnInit(): void {
    this.initForm();
  }

  ngOnChanges(): void {
    if (this.form) {
      this.initForm();
    }
  }

  initForm(): void {
    let role = this.user?.role ?? UserRole.EndUser;
    
    // Normalize role to number if it uses string or string enum key
    if (this.user?.role !== undefined) {
      if (typeof this.user.role === 'string') {
        const roleStr = this.user.role as unknown as string;
        if (!isNaN(Number(roleStr))) {
          role = Number(roleStr);
        } else {
          // Try to find enum by name
          const key = Object.keys(UserRole).find(k => k.toLowerCase() === roleStr.toLowerCase()) as keyof typeof UserRole;
          if (key) {
            role = UserRole[key];
          }
        }
      }
    }

    this.form = this.fb.group({
      firstName: [this.user?.firstName || '', [Validators.required]],
      lastName: [this.user?.lastName || '', [Validators.required]],
      email: [{ value: this.user?.email || '', disabled: !!this.user }, [Validators.required, Validators.email]],
      password: [
        '',
        this.user ? [] : [Validators.required, Validators.minLength(6)],
      ],
      role: [role, [Validators.required]],
    });
  }

  getErrorMessage(controlName: string): string | null {
    const control = this.form.get(controlName);
    if (control?.touched && control?.errors) {
      if (control.errors['required']) return this.translate.instant('errors.required');
      if (control.errors['email']) return this.translate.instant('errors.invalidEmail');
      if (control.errors['minlength']) return this.translate.instant('errors.minLength', { min: control.errors['minlength'].requiredLength });
    }
    return null;
  }

  onSubmit(): void {
    if (this.form.invalid) return;

    this.isSubmitting = true;
    const formValue = this.form.getRawValue();

    if (this.user) {
      const updateDto: UpdateUserDto = {
        id: this.user.id,
        firstName: formValue.firstName,
        lastName: formValue.lastName,
        role: formValue.role,
        isActive: this.user.isActive // Preserve existing status
      };

      this.userService.updateUser(this.user.id, updateDto).subscribe({
        next: () => {
          this.isSubmitting = false;
          this.toaster.success(this.translate.instant('userManagement.userUpdated'));
          this.saved.emit();
        },
        error: (err) => {
          console.error(err);
          this.isSubmitting = false;
          this.toaster.error(this.translate.instant('userManagement.errorUpdatingUser'));
        }
      });
    } else {
      const createDto: CreateUserDto = {
        email: formValue.email,
        password: formValue.password,
        firstName: formValue.firstName,
        lastName: formValue.lastName,
        role: formValue.role
      };

      this.userService.createUser(createDto).subscribe({
        next: () => {
          this.isSubmitting = false;
          this.toaster.success(this.translate.instant('userManagement.userCreated'));
          this.saved.emit();
        },
        error: (err) => {
          console.error(err);
          this.isSubmitting = false;
          this.toaster.error(this.translate.instant('userManagement.errorCreatingUser'));
        }
      });
    }
  }
}
