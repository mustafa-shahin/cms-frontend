import { Component, input, output, signal } from '@angular/core';

import { HttpEventType, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { ImageUploadService, UploadImageResponse } from '@cms/shared/utils';

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
  imports: [],
  providers: [ImageUploadService],
  template: `
    <div class="image-upload">
      <!-- Upload Area -->
      @if (!uploadState()) {
        <div
          class="upload-area"
          [class.dragover]="isDragging()"
          (drop)="onDrop($event)"
          (dragover)="onDragOver($event)"
          (dragleave)="onDragLeave($event)"
          (click)="fileInput.click()"
          (keydown.enter)="fileInput.click()"
          (keydown.space)="fileInput.click()"
          tabindex="0"
          role="button"
          aria-label="Upload image"
        >
          <div class="upload-icon">
            <svg class="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
          </div>
          <p class="upload-text">{{ uploadText() }}</p>
          <p class="upload-hint">or click to browse</p>
          <p class="upload-info">Supported formats: JPEG, PNG, WebP, GIF (max 10 MB)</p>
        </div>

        <input
          #fileInput
          type="file"
          accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
          (change)="onFileSelected($event)"
          class="hidden"
        />
      }

      <!-- Upload Progress -->
      @if (uploadState() && uploadState()!.uploading) {
        <div class="upload-progress">
          <div class="progress-info">
            <p class="file-name">{{ uploadState()!.file.name }}</p>
            <p class="progress-text">Uploading... {{ uploadState()!.progress }}%</p>
          </div>
          <div class="progress-bar-container">
            <div class="progress-bar" [style.width.%]="uploadState()!.progress"></div>
          </div>
        </div>
      }

      <!-- Upload Success -->
      @if (uploadState() && uploadState()!.result) {
        <div class="upload-success">
          <div class="success-icon">
            <svg class="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <div class="success-info">
            <p class="success-title">Upload Complete!</p>
            <p class="file-info">{{ uploadState()!.result!.originalName }} ({{ formatFileSize(uploadState()!.result!.size) }})</p>
            <p class="dimensions">{{ uploadState()!.result!.width }} × {{ uploadState()!.result!.height }} pixels</p>
          </div>
          @if (showPreview()) {
            <img
              [src]="getImageUrl(uploadState()!.result!.id)"
              [alt]="uploadState()!.result!.altText || 'Uploaded image'"
              class="preview-image"
            />
          }
          @if (allowMultiple()) {
            <button type="button" (click)="reset()" class="btn-upload-another">
              Upload Another
            </button>
          }
        </div>
      }

      <!-- Upload Error -->
      @if (uploadState() && uploadState()!.error) {
        <div class="upload-error">
          <div class="error-icon">
            <svg class="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <p class="error-message">{{ uploadState()!.error }}</p>
          <button type="button" (click)="reset()" class="btn-try-again">
            Try Again
          </button>
        </div>
      }
    </div>
  `,
  styles: [`
    .image-upload {
      width: 100%;
    }

    .upload-area {
      border: 2px dashed #d1d5db;
      border-radius: 0.5rem;
      padding: 3rem 1rem;
      text-align: center;
      cursor: pointer;
      transition: all 0.2s;
      background: #f9fafb;
    }

    .upload-area:hover,
    .upload-area.dragover {
      border-color: #3b82f6;
      background: #eff6ff;
    }

    .upload-icon {
      display: flex;
      justify-content: center;
      margin-bottom: 1rem;
    }

    .upload-text {
      font-size: 1.125rem;
      font-weight: 500;
      color: #374151;
      margin-bottom: 0.5rem;
    }

    .upload-hint {
      font-size: 0.875rem;
      color: #6b7280;
      margin-bottom: 0.5rem;
    }

    .upload-info {
      font-size: 0.75rem;
      color: #9ca3af;
    }

    .hidden {
      display: none;
    }

    .upload-progress,
    .upload-success,
    .upload-error {
      padding: 2rem;
      border: 1px solid #e5e7eb;
      border-radius: 0.5rem;
      background: white;
    }

    .progress-info {
      margin-bottom: 1rem;
    }

    .file-name {
      font-weight: 500;
      color: #111827;
      margin-bottom: 0.25rem;
    }

    .progress-text {
      font-size: 0.875rem;
      color: #6b7280;
    }

    .progress-bar-container {
      height: 0.5rem;
      background: #e5e7eb;
      border-radius: 0.25rem;
      overflow: hidden;
    }

    .progress-bar {
      height: 100%;
      background: #3b82f6;
      transition: width 0.3s;
    }

    .upload-success {
      text-align: center;
    }

    .success-icon,
    .error-icon {
      display: flex;
      justify-content: center;
      margin-bottom: 1rem;
    }

    .success-title {
      font-size: 1.125rem;
      font-weight: 600;
      color: #059669;
      margin-bottom: 0.5rem;
    }

    .file-info {
      color: #374151;
      margin-bottom: 0.25rem;
    }

    .dimensions {
      font-size: 0.875rem;
      color: #6b7280;
      margin-bottom: 1rem;
    }

    .preview-image {
      max-width: 100%;
      max-height: 200px;
      object-fit: contain;
      margin: 1rem auto;
      border-radius: 0.375rem;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    }

    .btn-upload-another,
    .btn-try-again {
      padding: 0.5rem 1rem;
      background: #3b82f6;
      color: white;
      border: none;
      border-radius: 0.375rem;
      font-weight: 500;
      cursor: pointer;
      transition: background 0.2s;
    }

    .btn-upload-another:hover,
    .btn-try-again:hover {
      background: #2563eb;
    }

    .error-message {
      color: #dc2626;
      margin-bottom: 1rem;
    }
  `]
})
export class ImageUploadComponent {
  private readonly imageUploadService = signal(new ImageUploadService());

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
    const error = this.imageUploadService().getValidationError(file);
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

    this.imageUploadService().uploadImage({
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
    return this.imageUploadService().getMediumUrl(imageId);
  }

  formatFileSize(bytes: number): string {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  }
}
