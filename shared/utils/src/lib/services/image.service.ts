import { Injectable, inject } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { EnvironmentService } from './environment.service';
import { ImageVariant } from './image-upload.service';
import {
  ImageListDto,
  UploadImageResponse,
  UpdateImageDto,
  PaginatedResponse,
} from '@cms/shared/api-interfaces';

/**
 * Service for managing images in the CMS.
 * Handles CRUD operations for image files and metadata.
 */
@Injectable({
  providedIn: 'root',
})
export class ImageService {
  private readonly apiService = inject(ApiService);
  private readonly environmentService = inject(EnvironmentService);
  private readonly endpoint = 'images';

  /**
   * Get a paginated list of images.
   */
  getImages(
    pageNumber = 1,
    pageSize = 12,
    searchTerm?: string,
    sortBy?: string,
    sortDescending = false
  ): Observable<PaginatedResponse<ImageListDto>> {
    let params = new HttpParams()
      .set('pageNumber', pageNumber)
      .set('pageSize', pageSize)
      .set('sortDescending', sortDescending);

    if (searchTerm) params = params.set('searchTerm', searchTerm);
    if (sortBy) params = params.set('sortBy', sortBy);

    return this.apiService.getPaginated<ImageListDto>(this.endpoint, { params });
  }

  /**
   * Get a single image by ID.
   */
  getImage(id: number): Observable<ImageListDto> {
    return this.apiService.get<ImageListDto>(`${this.endpoint}/${id}`);
  }

  /**
   * Upload a new image with optional metadata.
   */
  uploadImage(
    file: File,
    altText?: string,
    caption?: string,
    folderId?: number
  ): Observable<UploadImageResponse> {
    const formData = new FormData();
    formData.append('file', file);
    if (altText) formData.append('altText', altText);
    if (caption) formData.append('caption', caption);
    if (folderId) formData.append('folderId', folderId.toString());

    return this.apiService.post<UploadImageResponse>(
      `${this.endpoint}/upload`,
      formData
    );
  }

  /**
   * Update image metadata (alt text, caption, folder).
   */
  updateImage(id: number, dto: UpdateImageDto): Observable<ImageListDto> {
    return this.apiService.put<ImageListDto>(`${this.endpoint}/${id}`, dto);
  }

  /**
   * Delete an image by ID.
   */
  deleteImage(id: number): Observable<void> {
    return this.apiService.delete<void>(`${this.endpoint}/${id}`);
  }

  /**
   * Download an image as a blob.
   * Uses authenticated request to get the file data.
   */
  downloadImage(id: number): Observable<Blob> {
    return this.apiService.getBlob(`${this.endpoint}/${id}/download`);
  }

  /**
   * Generate the URL for accessing an image.
   * @param id Image ID
   * @param variant Image variant (original, thumbnail, medium)
   * @returns Full URL to the image
   */
  getImageUrl(id: number, variant: ImageVariant = 'original'): string {
    const baseUrl = this.environmentService.apiUrl;
    const base = `${baseUrl}/${this.endpoint}/${id}`;
    
    switch (variant) {
      case 'thumbnail':
        return `${base}/thumbnail`;
      case 'medium':
        return `${base}/medium`;
      default:
        return `${base}/file`;
    }
  }

  /**
   * Generate the URL for downloading an image.
   * This endpoint returns the file with Content-Disposition: attachment header.
   * @param id Image ID
   * @returns Full URL for downloading the image
   */
  getDownloadUrl(id: number): string {
    const baseUrl = this.environmentService.apiUrl;
    return `${baseUrl}/${this.endpoint}/${id}/download`;
  }

  /**
   * Format file size for display.
   */
  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
}
