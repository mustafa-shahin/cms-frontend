import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ImageFormComponent } from './image-form.component';
import { ReactiveFormsModule, Validators } from '@angular/forms';
import { ImageService, ImageUploadService, TranslationService, ToasterService } from '@cms/shared/utils';
import { ImageListDto } from '@cms/shared/api-interfaces';
import { of, throwError } from 'rxjs';
import { HttpEventType } from '@angular/common/http';

describe('ImageFormComponent', () => {
  let component: ImageFormComponent;
  let fixture: ComponentFixture<ImageFormComponent>;
  let mockImageService: Partial<ImageService>;
  let mockImageUploadService: Partial<ImageUploadService>;
  let mockTranslationService: Partial<TranslationService>;
  let mockToasterService: Partial<ToasterService>;

  const mockImage: ImageListDto = {
    id: 123,
    fileName: 'test.jpg',
    originalName: 'test.jpg',
    contentType: 'image/jpeg',
    size: 1024,
    width: 800,
    height: 600,
    hasThumbnail: true,
    hasMediumVersion: true,
    createdAt: new Date(),
    altText: 'Test Alt',
    caption: 'Test Caption'
  };

  const mockFile = new File([''], 'test.png', { type: 'image/png' });

  beforeEach(async () => {
    mockImageService = {
      getImageUrl: jest.fn().mockReturnValue('http://example.com/preview.jpg'),
      updateImage: jest.fn().mockReturnValue(of(void 0))
    };

    mockImageUploadService = {
      getValidationError: jest.fn().mockReturnValue(null),
      uploadImage: jest.fn().mockReturnValue(of({ type: HttpEventType.Response, body: {} })),
      calculateProgress: jest.fn().mockReturnValue({ progress: 50 })
    };

    mockTranslationService = {
      instant: jest.fn((key: string) => key)
    };

    mockToasterService = {
      success: jest.fn(),
      error: jest.fn()
    };

    await TestBed.configureTestingModule({
      imports: [ImageFormComponent, ReactiveFormsModule],
      providers: [
        { provide: ImageService, useValue: mockImageService },
        { provide: ImageUploadService, useValue: mockImageUploadService },
        { provide: TranslationService, useValue: mockTranslationService },
        { provide: ToasterService, useValue: mockToasterService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ImageFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Initialization', () => {
    it('should initialize empty form for new upload', () => {
      expect(component.form.get('file')).toBeTruthy();
      expect(component.form.get('file')?.hasValidator(Validators.required)).toBeTruthy();
      expect(component.previewUrl).toBeNull();
    });

    it('should initialize form with image data for editing', () => {
      component.image = mockImage;
      component.ngOnInit(); // Manually trigger since ngOnChanges handles initial setup too if inputs binding changed
      
      expect(component.form.get('altText')?.value).toBe(mockImage.altText);
      expect(component.form.get('caption')?.value).toBe(mockImage.caption);
      expect(component.form.get('file')).toBeNull(); // File control not added for existing images
      expect(component.previewUrl).toBe('http://example.com/preview.jpg');
    });
  });

  describe('ngOnChanges', () => {
    it('should reset form when image input changes to null', () => {
      component.image = mockImage;
      component.ngOnChanges();
      
      expect(component.selectedFile).toBeNull();
      
      component.image = null;
      component.ngOnChanges();
      
      expect(component.previewUrl).toBeNull();
      expect(component.form.get('file')).toBeTruthy();
    });
  });

  describe('File Handling', () => {
    it('should handle file selection via input', () => {
      const event = {
        target: {
          files: [mockFile]
        }
      } as unknown as Event;

      component.onFileSelected(event);

      expect(mockImageUploadService.getValidationError).toHaveBeenCalledWith(mockFile);
      expect(component.selectedFile).toBe(mockFile);
    });

    it('should show error if validaton fails', () => {
      (mockImageUploadService.getValidationError as jest.Mock).mockReturnValue('Invalid file');
      
      const event = {
        target: {
          files: [mockFile]
        }
      } as unknown as Event;

      component.onFileSelected(event);

      expect(mockToasterService.error).toHaveBeenCalledWith('Invalid file');
      expect(component.selectedFile).toBeNull();
    });

    it('should handle drag and drop events', () => {
      const preventDefaultSpy = jest.fn();
      const stopPropagationSpy = jest.fn();
      
      const dragEvent = {
        preventDefault: preventDefaultSpy,
        stopPropagation: stopPropagationSpy,
        dataTransfer: {
            files: [mockFile]
        }
      } as unknown as DragEvent;

      // Drag Over
      component.onDragOver(dragEvent);
      expect(component.isDragging).toBe(true);
      expect(preventDefaultSpy).toHaveBeenCalled();

      // Drag Leave
      component.onDragLeave(dragEvent);
      expect(component.isDragging).toBe(false);

      // Drop
      component.onDrop(dragEvent);
      expect(component.isDragging).toBe(false);
      expect(component.selectedFile).toBe(mockFile);
    });

     it('should remove file', () => {
      component.selectedFile = mockFile;
      component.previewUrl = 'blob:url';
      
      component.removeFile();

      expect(component.selectedFile).toBeNull();
      expect(component.previewUrl).toBeNull();
      expect(component.form.get('file')?.value).toBeNull();
    });
  });

  describe('Submission', () => {
    it('should update existing image', () => {
      component.image = mockImage;
      component.initForm();
      component.form.patchValue({ altText: 'New Alt' });

      component.onSubmit();

      expect(mockImageService.updateImage).toHaveBeenCalledWith(123, expect.objectContaining({
        altText: 'New Alt'
      }));
      expect(mockToasterService.success).toHaveBeenCalled();
    });

    it('should upload new image', () => {
      component.selectedFile = mockFile;
      component.form.get('file')?.setValue(mockFile);
      
      component.onSubmit();

      expect(mockImageUploadService.uploadImage).toHaveBeenCalledWith(expect.objectContaining({
        file: mockFile
      }));
      expect(component.uploadProgress).toBe(0); // Resets after complete
      expect(mockToasterService.success).toHaveBeenCalled();
    });

    it('should update progress during upload', () => {
       const progressEvent = { type: HttpEventType.UploadProgress, loaded: 50, total: 100 };
       (mockImageUploadService.uploadImage as jest.Mock).mockReturnValue(of(progressEvent));
       
       component.selectedFile = mockFile;
       component.form.get('file')?.setValue(mockFile);

       component.onSubmit();

       expect(mockImageUploadService.calculateProgress).toHaveBeenCalledWith(progressEvent);
       expect(component.uploadProgress).toBe(50);
    });

    it('should handle update error', () => {
      component.image = mockImage;
      component.initForm();
      (mockImageService.updateImage as jest.Mock).mockReturnValue(throwError(() => new Error('Update failed')));
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => undefined);

      component.onSubmit();

      expect(mockToasterService.error).toHaveBeenCalled();
      expect(component.isSubmitting).toBe(false);
      
      consoleSpy.mockRestore();
    });

    it('should handle upload error', () => {
      component.selectedFile = mockFile;
      component.form.get('file')?.setValue(mockFile);
      (mockImageUploadService.uploadImage as jest.Mock).mockReturnValue(throwError(() => new Error('Upload failed')));
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => undefined);

      component.onSubmit();

      expect(mockToasterService.error).toHaveBeenCalled();
      expect(component.isSubmitting).toBe(false);
      
      consoleSpy.mockRestore();
    });

    it('should not submit if form is invalid', () => {
        // New upload requires file
        component.selectedFile = null;
        component.form.get('file')?.setValue(null);
        
        component.onSubmit();
        
        expect(mockImageUploadService.uploadImage).not.toHaveBeenCalled();
    });
  });
});
