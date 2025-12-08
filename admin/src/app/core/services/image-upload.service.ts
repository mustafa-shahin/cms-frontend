import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpEvent, HttpEventType, HttpProgressEvent } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface UploadImageRequest {
  file: File;
  folderId?: number;
  altText?: string;
  caption?: string;
}

export interface UploadImageResponse {
  id: number;
  fileName: string;
  originalName: string;
  contentType: string;
  size: number;
  width: number;
  height: number;
  altText?: string;
  caption?: string;
  hasThumbnail: boolean;
  hasMediumVersion: boolean;
  createdAt: string;
}

export interface UploadProgress {
  progress: number; // 0-100
  loaded: number;
  total: number;
}

export type ImageVariant = 'original' | 'thumbnail' | 'medium';

@Injectable({
  providedIn: 'root'
})
export class ImageUploadService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/${environment.apiVersion}/images`;

  /**
   * Upload an image file with progress tracking.
   */
  uploadImage(request: UploadImageRequest): Observable<HttpEvent<UploadImageResponse>> {
    const formData = new FormData();
    formData.append('file', request.file);

    if (request.folderId !== undefined) {
      formData.append('folderId', request.folderId.toString());
    }

    if (request.altText) {
      formData.append('altText', request.altText);
    }

    if (request.caption) {
      formData.append('caption', request.caption);
    }

    return this.http.post<UploadImageResponse>(
      `${this.apiUrl}/upload`,
      formData,
      {
        reportProgress: true,
        observe: 'events'
      }
    );
  }

  /**
   * Upload an image with simplified response (just the uploaded image data).
   */
  uploadImageSimple(request: UploadImageRequest): Observable<UploadImageResponse> {
    return this.uploadImage(request).pipe(
      map(event => {
        if (event.type === HttpEventType.Response) {
          return event.body!;
        }
        throw new Error('Upload not complete');
      })
    );
  }

  /**
   * Get the URL for an image by ID and variant.
   */
  getImageUrl(imageId: number, variant: ImageVariant = 'original'): string {
    if (variant === 'original') {
      return `${this.apiUrl}/${imageId}`;
    }
    return `${this.apiUrl}/${imageId}/${variant}`;
  }

  /**
   * Get the thumbnail URL for an image.
   */
  getThumbnailUrl(imageId: number): string {
    return this.getImageUrl(imageId, 'thumbnail');
  }

  /**
   * Get the medium-sized URL for an image.
   */
  getMediumUrl(imageId: number): string {
    return this.getImageUrl(imageId, 'medium');
  }

  /**
   * Validate if a file is a valid image.
   */
  isValidImage(file: File): boolean {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
    const maxSize = 10 * 1024 * 1024; // 10 MB

    if (!allowedTypes.includes(file.type.toLowerCase())) {
      return false;
    }

    if (file.size > maxSize) {
      return false;
    }

    return true;
  }

  /**
   * Get validation error message for a file.
   */
  getValidationError(file: File): string | null {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
    const maxSize = 10 * 1024 * 1024; // 10 MB

    if (!allowedTypes.includes(file.type.toLowerCase())) {
      return `Invalid file type. Allowed types: ${allowedTypes.join(', ')}`;
    }

    if (file.size > maxSize) {
      return `File size exceeds maximum allowed size of ${maxSize / (1024 * 1024)} MB`;
    }

    return null;
  }

  /**
   * Calculate upload progress percentage from HttpEvent.
   */
  calculateProgress(event: HttpEvent<any>): UploadProgress | null {
    if (event.type === HttpEventType.UploadProgress) {
      const progressEvent = event as HttpProgressEvent;
      const progress = progressEvent.total
        ? Math.round((100 * progressEvent.loaded) / progressEvent.total)
        : 0;

      return {
        progress,
        loaded: progressEvent.loaded,
        total: progressEvent.total || 0
      };
    }

    return null;
  }
}
