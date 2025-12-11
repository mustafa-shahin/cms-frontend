import { Component, input, output, signal, inject } from '@angular/core';
import { HttpEventType, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { ImageUploadService, UploadImageResponse } from '@cms/shared/utils';
import { IconComponent, ButtonComponent } from '@cms/shared/ui';

interface UploadState {
  file: File;
  progress: number;
  uploading: boolean;
  error: string | null;
  result: UploadImageResponse | null;
}

/**
 * Reusable image upload component with drag-and-drop support.
 */
@Component({
  selector: 'cms-image-upload',
  standalone: true,
  imports: [IconComponent, ButtonComponent],
  templateUrl: './image-upload.component.html',
})
export class ImageUploadComponent {
  private readonly imageUploadService = inject(ImageUploadService);

  // Inputs
  uploadText = input<string>('Drag and drop an image here');
  allowMultiple = input<boolean>(false);
  showPreview = input<boolean>(true);
  folderId = input<number | undefined>(undefined);

  // Outputs
  uploadComplete = output<UploadImageResponse>();
  uploadError = output<string>();

  // State
  isDragging = signal(false);
  uploadState = signal<UploadState | null>(null);

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging.set(true);
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging.set(false);
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging.set(false);

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

  private handleFile(file: File): void {
    // Validate file
    const error = this.imageUploadService.getValidationError(file);
    if (error) {
      this.uploadState.set({
        file,
        progress: 0,
        uploading: false,
        error,
        result: null
      });
      this.uploadError.emit(error);
      return;
    }

    // Start upload
    this.uploadState.set({
      file,
      progress: 0,
      uploading: true,
      error: null,
      result: null
    });

    this.imageUploadService.uploadImage({
      file,
      folderId: this.folderId()
    }).subscribe({
      next: (event: HttpEvent<UploadImageResponse>) => {
        if (event.type === HttpEventType.UploadProgress && event.total) {
          const progress = Math.round((100 * event.loaded) / event.total);
          this.uploadState.update(state => state ? { ...state, progress } : null);
        } else if (event.type === HttpEventType.Response && event.body) {
          this.uploadState.update(state => state ? {
            ...state,
            uploading: false,
            result: event.body || null
          } : null);
          this.uploadComplete.emit(event.body);
        }
      },
      error: (error: HttpErrorResponse) => {
        const errorMessage = error.error?.message || 'Upload failed. Please try again.';
        this.uploadState.update(state => state ? {
          ...state,
          uploading: false,
          error: errorMessage
        } : null);
        this.uploadError.emit(errorMessage);
      }
    });
  }

  reset(): void {
    this.uploadState.set(null);
  }

  getImageUrl(imageId: number): string {
    return this.imageUploadService.getMediumUrl(imageId);
  }

  formatFileSize(bytes: number): string {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  }
}
