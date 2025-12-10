import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ImageService, TranslationService, ToasterService } from '@cms/shared/utils';
import { ImageListDto } from '@cms/shared/api-interfaces';
import { IconComponent, DialogComponent } from '@cms/shared/ui';
import { ImageFormComponent } from '../image-form/image-form.component';

@Component({
  selector: 'cms-image-list',
  standalone: true,
  imports: [CommonModule, FormsModule, IconComponent, DialogComponent, ImageFormComponent],
  templateUrl: './image-list.component.html',
})
export class ImageListComponent implements OnInit {
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

  ngOnInit(): void {
    this.loadImages();
  }

  loadImages(): void {
    this.isLoading = true;
    this.imageService.getImages(this.pageNumber, this.pageSize, this.searchTerm).subscribe({
      next: (response) => {
        this.images = response.items;
        this.totalCount = response.totalCount;
        this.hasNextPage = response.hasNextPage;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Failed to load images', err);
        this.toaster.error(this.translate.instant('fileManagement.errorLoadingImages'));
        this.isLoading = false;
      }
    });
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

  getImageUrl(image: ImageListDto): string {
    return this.imageService.getImageUrl(image.id, 'thumbnail');
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
