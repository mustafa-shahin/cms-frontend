import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
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
 * Request body for searching images.
 * Matches the backend SearchImagesQuery structure.
 */
export interface SearchImagesRequest {
  searchTerm?: string;
  pageNumber?: number;
  pageSize?: number;
  sortBy?: string;
  sortDescending?: boolean;
}

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
   * Search and get a paginated list of images.
   * Uses POST /images/search endpoint.
   */
  getImages(
    pageNumber = 1,
    pageSize = 12,
    searchTerm?: string,
    sortBy?: string,
    sortDescending = false
  ): Observable<PaginatedResponse<ImageListDto>> {
    const request: SearchImagesRequest = {
      pageNumber,
      pageSize,
      sortDescending,
    };

    if (searchTerm) request.searchTerm = searchTerm;
    if (sortBy) request.sortBy = sortBy;

    return this.apiService.post<any>(
      `${this.endpoint}/search`,
      request
    ).pipe(
      map((searchResult) => {
        const items = searchResult.items?.map((item: any) => item.data || item) || [];

        return {
          success: true,
          statusCode: 200,
          items: items,
          pageNumber: searchResult.pageNumber,
          pageSize: searchResult.pageSize,
          totalCount: searchResult.totalCount,
          totalPages: searchResult.totalPages || Math.ceil(searchResult.totalCount / searchResult.pageSize),
          hasPreviousPage: searchResult.hasPreviousPage,
          hasNextPage: searchResult.hasNextPage,
          timestamp: new Date().toISOString()
        } as PaginatedResponse<ImageListDto>;
      })
    );
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
   * Downloads the original (full-size) version.
   */
  downloadImage(id: number): Observable<Blob> {
    return this.apiService.getBlob(`${this.endpoint}/${id}`);
  }

  /**
   * Get an image as a blob for display.
   * Uses authenticated request to get the image data.
   * @param id Image ID
   * @param variant Image variant (original, thumbnail, medium)
   * @returns Observable of Blob containing the image data
   */
  getImageBlob(id: number, variant: ImageVariant = 'original'): Observable<Blob> {
    let endpoint = `${this.endpoint}/${id}`;

    switch (variant) {
      case 'thumbnail':
        endpoint = `${this.endpoint}/${id}/thumbnail`;
        break;
      case 'medium':
        endpoint = `${this.endpoint}/${id}/medium`;
        break;
    }

    return this.apiService.getBlob(endpoint);
  }

  /**
   * Generate the URL for accessing an image.
   * @param id Image ID
   * @param variant Image variant (original, thumbnail, medium)
   * @returns Full URL to the image
   */
  getImageUrl(id: number, variant: ImageVariant = 'original'): string {
    const baseUrl = this.environmentService.apiUrl;
    const version = this.environmentService.apiVersion;
    const base = `${baseUrl}/${version}/${this.endpoint}/${id}`;

    switch (variant) {
      case 'thumbnail':
        return `${base}/thumbnail`;
      case 'medium':
        return `${base}/medium`;
      default:
        return base;
    }
  }

  /**
   * Generate the URL for downloading an image.
   * Downloads the original (full-size) version.
   * @param id Image ID
   * @returns Full URL for downloading the image
   */
  getDownloadUrl(id: number): string {
    const baseUrl = this.environmentService.apiUrl;
    const version = this.environmentService.apiVersion;
    return `${baseUrl}/${version}/${this.endpoint}/${id}`;
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
