import { Component, EventEmitter, Input, OnInit, Output, inject, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ImageService, TranslationService, ToasterService } from '@cms/shared/utils';
import { ImageUploadService } from '@cms/shared/utils';
import { IconComponent, ButtonComponent } from '@cms/shared/ui';
import { ImageListDto, UpdateImageDto } from '@cms/shared/api-interfaces';
import { HttpEventType } from '@angular/common/http';

@Component({
  selector: 'cms-image-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, IconComponent, ButtonComponent],
  templateUrl: './image-form.component.html',
})
export class ImageFormComponent implements OnInit, OnChanges {
  @Input() image: ImageListDto | null = null;
  @Output() cancelled = new EventEmitter<void>();
  @Output() saved = new EventEmitter<void>();

  protected readonly translate = inject(TranslationService);
  private readonly fb = inject(FormBuilder);
  private readonly imageService = inject(ImageService);
  private readonly imageUploadService = inject(ImageUploadService);
  private readonly toaster = inject(ToasterService);

  form!: FormGroup;
  isSubmitting = false;
  
  // Upload state
  selectedFile: File | null = null;
  previewUrl: string | null = null;
  uploadProgress = 0;
  isDragging = false;

  // Allowed file types
  readonly allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
  readonly maxFileSize = 10 * 1024 * 1024; // 10MB

  ngOnInit(): void {
    this.initForm();
    if (this.image) {
      this.previewUrl = this.imageService.getImageUrl(this.image.id, 'medium');
    }
  }

  ngOnChanges(): void {
    if (this.form) {
      this.initForm();
      if (this.image) {
        this.previewUrl = this.imageService.getImageUrl(this.image.id, 'medium');
      } else {
        this.previewUrl = null;
        this.selectedFile = null;
      }
    }
  }

  initForm(): void {
    this.form = this.fb.group({
      altText: [this.image?.altText || ''],
      caption: [this.image?.caption || ''],
    });

    // File required only for new uploads
    if (!this.image) {
      this.form.addControl('file', this.fb.control(null, [Validators.required]));
    }
  }

  getErrorMessage(controlName: string): string | null {
    const control = this.form.get(controlName);
    if (control?.touched && control?.errors) {
      if (control.errors['required']) return this.translate.instant('errors.required');
    }
    return null;
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = true;
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = false;
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = false;

    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      this.handleFile(files[0]);
    }
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.handleFile(input.files[0]);
    }
  }

  handleFile(file: File): void {
    const error = this.imageUploadService.getValidationError(file);
    if (error) {
      this.toaster.error(error);
      return;
    }

    this.selectedFile = file;
    this.form.get('file')?.setValue(file);

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      this.previewUrl = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  }

  removeFile(): void {
    this.selectedFile = null;
    this.previewUrl = null;
    this.form.get('file')?.setValue(null);
  }

  onSubmit(): void {
    if (this.form.invalid) return;

    this.isSubmitting = true;
    const formValue = this.form.getRawValue();

    if (this.image) {
      // Update existing image metadata
      const updateDto: UpdateImageDto = {
        id: this.image.id,
        altText: formValue.altText || undefined,
        caption: formValue.caption || undefined,
      };

      this.imageService.updateImage(this.image.id, updateDto).subscribe({
        next: () => {
          this.isSubmitting = false;
          this.toaster.success(this.translate.instant('fileManagement.imageUpdated'));
          this.saved.emit();
        },
        error: (err) => {
          console.error(err);
          this.isSubmitting = false;
          this.toaster.error(this.translate.instant('fileManagement.errorUpdatingImage'));
        }
      });
    } else {
      // Upload new image
      if (!this.selectedFile) return;

      this.imageUploadService.uploadImage({
        file: this.selectedFile,
        altText: formValue.altText || undefined,
        caption: formValue.caption || undefined,
      }).subscribe({
        next: (event) => {
          if (event.type === HttpEventType.UploadProgress) {
            const progress = this.imageUploadService.calculateProgress(event);
            if (progress) {
              this.uploadProgress = progress.progress;
            }
          } else if (event.type === HttpEventType.Response) {
            this.isSubmitting = false;
            this.uploadProgress = 0;
            this.toaster.success(this.translate.instant('fileManagement.imageUploaded'));
            this.saved.emit();
          }
        },
        error: (err) => {
          console.error(err);
          this.isSubmitting = false;
          this.uploadProgress = 0;
          this.toaster.error(this.translate.instant('fileManagement.errorUploadingImage'));
        }
      });
    }
  }

  onCancel(): void {
    this.cancelled.emit();
  }
}
