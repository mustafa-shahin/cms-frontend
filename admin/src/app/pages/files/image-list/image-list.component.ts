import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ImageService, TranslationService, ToasterService } from '@cms/shared/utils';
import { ImageListDto } from '@cms/shared/api-interfaces';
import { 
  IconComponent, 
  DialogComponent, 
  ButtonComponent, 
  CardComponent, 
  PageHeaderComponent, 
  SearchBarComponent,
  EmptyStateComponent,
  LoadingSpinnerComponent,
  PaginationComponent 
} from '@cms/shared/ui';
import { ImageFormComponent } from '../image-form/image-form.component';

@Component({
  selector: 'cms-image-list',
  standalone: true,
  imports: [
    CommonModule, 
    IconComponent, 
    DialogComponent, 
    ImageFormComponent,
    ButtonComponent,
    CardComponent,
    PageHeaderComponent,
    SearchBarComponent,
    EmptyStateComponent,
    LoadingSpinnerComponent,
    PaginationComponent
  ],
  templateUrl: './image-list.component.html',
})
export class ImageListComponent implements OnInit, OnDestroy {
  protected readonly translate = inject(TranslationService);
  private readonly imageService = inject(ImageService);
  private readonly toaster = inject(ToasterService);

  images: ImageListDto[] = [];
  totalCount = 0;
  pageNumber = 1;
  pageSize = 12;
  searchTerm = '';
  hasNextPage = false;
  isLoading = false;

  isModalOpen = false;
  selectedImage: ImageListDto | null = null;
  Math = Math;

  // Map to store blob URLs for images
  imageUrls = new Map<number, string>();

  ngOnInit(): void {
    this.loadImages();
  }

  ngOnDestroy(): void {
    this.cleanupBlobUrls();
  }

  loadImages(): void {
    this.isLoading = true;

    // Clean up old blob URLs before loading new images
    this.cleanupBlobUrls();

    this.imageService.getImages(this.pageNumber, this.pageSize, this.searchTerm).subscribe({
      next: (response) => {
        this.images = response.items;
        this.totalCount = response.totalCount;
        this.hasNextPage = response.hasNextPage;
        this.isLoading = false;

        // Load thumbnail blobs for each image
        this.loadImageThumbnails();
      },
      error: (err) => {
        console.error('Failed to load images', err);
        this.toaster.error(this.translate.instant('fileManagement.errorLoadingImages'));
        this.isLoading = false;
      }
    });
  }

  loadImageThumbnails(): void {
    this.images.forEach(image => {
      this.imageService.getImageBlob(image.id, 'medium').subscribe({
        next: (blob) => {
          const url = URL.createObjectURL(blob);
          this.imageUrls.set(image.id, url);
        },
        error: (err) => {
          console.error(`Failed to load thumbnail for image ${image.id}`, err);
        }
      });
    });
  }

  cleanupBlobUrls(): void {
    this.imageUrls.forEach(url => URL.revokeObjectURL(url));
    this.imageUrls.clear();
  }

  onSearch(): void {
    this.pageNumber = 1;
    this.loadImages();
  }

  changePage(page: number): void {
    this.pageNumber = page;
    this.loadImages();
  }

  openUploadModal(): void {
    this.selectedImage = null;
    this.isModalOpen = true;
  }

  onEdit(image: ImageListDto): void {
    this.selectedImage = image;
    this.isModalOpen = true;
  }

  closeModal(): void {
    this.isModalOpen = false;
    this.selectedImage = null;
  }

  onImageSaved(): void {
    this.closeModal();
    this.loadImages();
  }

  onDelete(image: ImageListDto): void {
    if (confirm(this.translate.instant('fileManagement.confirmDelete'))) {
      this.imageService.deleteImage(image.id).subscribe({
        next: () => {
          this.toaster.success(this.translate.instant('fileManagement.imageDeleted'));
          this.loadImages();
        },
        error: (err) => {
          console.error(err);
          this.toaster.error(this.translate.instant('fileManagement.errorDeletingImage'));
        }
      });
    }
  }

  getImageUrl(image: ImageListDto): string | undefined {
    return this.imageUrls.get(image.id);
  }

  formatFileSize(bytes: number): string {
    return this.imageService.formatFileSize(bytes);
  }

  onDownload(image: ImageListDto): void {
    this.imageService.downloadImage(image.id).subscribe({
      next: (blob: Blob) => {
        // Create a blob URL and trigger download
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = image.originalName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      },
      error: () => {
        this.toaster.error(this.translate.instant('fileManagement.errorDownloadingImage'));
      }
    });
  }
}
