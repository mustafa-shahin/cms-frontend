import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ImageListComponent } from './image-list.component';
import { ImageService, TranslationService, ToasterService } from '@cms/shared/utils';
import { ImageListDto, ImageListResponse } from '@cms/shared/api-interfaces';
import { of, throwError } from 'rxjs';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

// Mock child components to avoid dependency issues
import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({ selector: 'cms-image-form', standalone: true, template: '' })
class MockImageFormComponent {
  @Input() image: ImageListDto | null = null;
  @Output() cancelled = new EventEmitter<void>();
  @Output() saved = new EventEmitter<void>();
}

describe('ImageListComponent', () => {
  let component: ImageListComponent;
  let fixture: ComponentFixture<ImageListComponent>;
  let mockImageService: Partial<ImageService>;
  let mockTranslationService: Partial<TranslationService>;
  let mockToasterService: Partial<ToasterService>;

  const mockImages: ImageListDto[] = [
    {
      id: 1,
      fileName: 'img1.jpg',
      originalName: 'img1.jpg',
      contentType: 'image/jpeg',
      size: 1000,
      width: 100,
      height: 100,
      hasThumbnail: true,
      hasMediumVersion: true,
      createdAt: new Date(),
      altText: 'Alt 1'
    },
    {
      id: 2,
      fileName: 'img2.png',
      originalName: 'img2.png',
      contentType: 'image/png',
      size: 2000,
      width: 200,
      height: 200,
      hasThumbnail: true,
      hasMediumVersion: true,
      createdAt: new Date(),
      altText: 'Alt 2'
    }
  ];

  const mockResponse: ImageListResponse = {
    items: mockImages,
    totalCount: 2,
    pageNumber: 1,
    pageSize: 10,
    hasNextPage: false,
    hasPreviousPage: false
  };

  beforeEach(async () => {
    mockImageService = {
      getImages: jest.fn().mockReturnValue(of(mockResponse)),
      deleteImage: jest.fn().mockReturnValue(of(void 0)),
      getImageUrl: jest.fn((id: number) => `url/${id}`),
      formatFileSize: jest.fn((bytes: number) => `${bytes} B`),
      downloadImage: jest.fn().mockReturnValue(of(new Blob(['test'], { type: 'image/jpeg' })))
    };

    mockTranslationService = {
      instant: jest.fn((key: string) => key)
    };

    mockToasterService = {
      success: jest.fn(),
      error: jest.fn()
    };

    await TestBed.configureTestingModule({
      imports: [ImageListComponent, NoopAnimationsModule],
      providers: [
        { provide: ImageService, useValue: mockImageService },
        { provide: TranslationService, useValue: mockTranslationService },
        { provide: ToasterService, useValue: mockToasterService }
      ]
    })
    .overrideComponent(ImageListComponent, {
      remove: { imports: [MockImageFormComponent] },
      add: { imports: [MockImageFormComponent] }
    })
    .compileComponents();

    fixture = TestBed.createComponent(ImageListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Initialization', () => {
    it('should load images on init', () => {
      expect(mockImageService.getImages).toHaveBeenCalledWith(1, 12, '');
      expect(component.images).toEqual(mockImages);
      expect(component.totalCount).toBe(2);
      expect(component.isLoading).toBe(false);
    });

    it('should handle load error', () => {
      (mockImageService.getImages as jest.Mock).mockReturnValue(throwError(() => new Error('Load failed')));
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => undefined);
      
      component.loadImages(); // Re-trigger to test error path explicitly or rely on ngOnInit if reset

      expect(mockToasterService.error).toHaveBeenCalled();
      expect(component.isLoading).toBe(false);
      
      consoleSpy.mockRestore();
    });
  });

  describe('Navigation & Search', () => {
    it('should change page', () => {
      component.changePage(2);
      expect(component.pageNumber).toBe(2);
      expect(mockImageService.getImages).toHaveBeenCalledWith(2, 12, '');
    });

    it('should search and reset page', () => {
      component.pageNumber = 3;
      component.searchTerm = 'test';
      component.onSearch();
      
      expect(component.pageNumber).toBe(1);
      expect(mockImageService.getImages).toHaveBeenCalledWith(1, 12, 'test');
    });
  });

  describe('Modal Interactions', () => {
    it('should open modal for upload', () => {
      component.openUploadModal();
      expect(component.selectedImage).toBeNull();
      expect(component.isModalOpen).toBe(true);
    });

    it('should open modal for edit', () => {
      const image = mockImages[0];
      component.onEdit(image);
      expect(component.selectedImage).toBe(image);
      expect(component.isModalOpen).toBe(true);
    });

    it('should close modal', () => {
      component.isModalOpen = true;
      component.selectedImage = mockImages[0];
      
      component.closeModal();
      
      expect(component.isModalOpen).toBe(false);
      expect(component.selectedImage).toBeNull();
    });

    it('should reload images on image saved', () => {
      const loadSpy = jest.spyOn(component, 'loadImages');
      component.onImageSaved();
      
      expect(component.isModalOpen).toBe(false);
      expect(loadSpy).toHaveBeenCalled();
    });
  });

  describe('Delete Operation', () => {
    it('should delete image if confirmed', () => {
      jest.spyOn(window, 'confirm').mockReturnValue(true);
      const image = mockImages[0];
      
      component.onDelete(image);

      expect(mockImageService.deleteImage).toHaveBeenCalledWith(image.id);
      expect(mockToasterService.success).toHaveBeenCalled();
      expect(mockImageService.getImages).toHaveBeenCalled(); // Reloads
    });

    it('should not delete if not confirmed', () => {
      jest.spyOn(window, 'confirm').mockReturnValue(false);
      const image = mockImages[0];
      
      component.onDelete(image);

      expect(mockImageService.deleteImage).not.toHaveBeenCalled();
    });

    it('should handle delete error', () => {
      jest.spyOn(window, 'confirm').mockReturnValue(true);
      (mockImageService.deleteImage as jest.Mock).mockReturnValue(throwError(() => new Error('Delete failed')));
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => undefined);
      const image = mockImages[0];

      component.onDelete(image);

      expect(mockToasterService.error).toHaveBeenCalled();
      
      consoleSpy.mockRestore();
    });
  });

  describe('Download Operation', () => {
    beforeEach(() => {
      // Mock window.URL methods
      global.URL.createObjectURL = jest.fn(() => 'blob:url');
      global.URL.revokeObjectURL = jest.fn();
    });

    it('should download image successfully', () => {
      const image = mockImages[0];
      
      // Spy on document methods for link click
      const link = document.createElement('a');
      jest.spyOn(document, 'createElement').mockReturnValue(link);
      jest.spyOn(document.body, 'appendChild');
      jest.spyOn(document.body, 'removeChild');
      jest.spyOn(link, 'click');

      component.onDownload(image);

      expect(mockImageService.downloadImage).toHaveBeenCalledWith(image.id);
      expect(global.URL.createObjectURL).toHaveBeenCalled();
      expect(link.click).toHaveBeenCalled();
      expect(global.URL.revokeObjectURL).toHaveBeenCalled();
    });

    it('should handle download error', () => {
      (mockImageService.downloadImage as jest.Mock).mockReturnValue(throwError(() => new Error('Download failed')));
      const image = mockImages[0];

      component.onDownload(image);

      expect(mockToasterService.error).toHaveBeenCalled();
    });
  });

  describe('Helpers', () => {
    it('should get image url', () => {
      component.getImageUrl(mockImages[0]);
      expect(mockImageService.getImageUrl).toHaveBeenCalledWith(mockImages[0].id, 'thumbnail');
    });

    it('should format file size', () => {
      component.formatFileSize(1000);
      expect(mockImageService.formatFileSize).toHaveBeenCalledWith(1000);
    });
  });
});
