/**
 * Image list item DTO for displaying in grids/tables.
 */
export interface ImageListDto {
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
  createdAt: Date;
  lastModifiedAt?: Date;
}

/**
 * Paginated response for image list.
 */
export interface ImageListResponse {
  items: ImageListDto[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

/**
 * Request for uploading a new image.
 */
export interface UploadImageRequest {
  file: File;
  folderId?: number;
  altText?: string;
  caption?: string;
}

/**
 * Response after uploading an image.
 */
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
  createdAt: Date;
}

/**
 * Request to update image metadata.
 */
export interface UpdateImageDto {
  id: number;
  altText?: string;
  caption?: string;
  folderId?: number;
}
