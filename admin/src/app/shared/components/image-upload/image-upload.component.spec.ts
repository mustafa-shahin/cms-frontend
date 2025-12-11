import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ImageUploadComponent } from './image-upload.component';
import { ImageUploadService, UploadImageResponse, EnvironmentService } from '@cms/shared/utils';
import { Subject, of } from 'rxjs';
import { HttpEventType, HttpProgressEvent, HttpResponse, HttpErrorResponse, HttpEvent, HttpHeaders } from '@angular/common/http';
import { NO_ERRORS_SCHEMA } from '@angular/core';

// Mock DataTransfer for Jest/jsdom environment
class MockDataTransfer {
  private data: Map<string, string> = new Map();
  private fileList: File[] = [];
  
  get files(): FileList {
    return this.fileList as unknown as FileList;
  }
  
  get items(): DataTransferItemList {
    return {
      add: (file: File) => {
        this.fileList.push(file);
        return null;
      },
      length: this.fileList.length
    } as unknown as DataTransferItemList;
  }
  
  setData(format: string, data: string): void {
    this.data.set(format, data);
  }
  
  getData(format: string): string {
    return this.data.get(format) || '';
  }
}

// Mock DragEvent for Jest/jsdom environment
class MockDragEvent extends Event {
  readonly dataTransfer: DataTransfer | null;
  readonly clientX: number = 0;
  readonly clientY: number = 0;
  
  constructor(type: string, eventInitDict?: { dataTransfer?: DataTransfer }) {
    super(type, { bubbles: true, cancelable: true });
    this.dataTransfer = eventInitDict?.dataTransfer || null;
  }
}

// Set up global mocks
(global as unknown as { DataTransfer: typeof MockDataTransfer }).DataTransfer = MockDataTransfer;
(global as unknown as { DragEvent: typeof MockDragEvent }).DragEvent = MockDragEvent;

describe('ImageUploadComponent', () => {
  let component: ImageUploadComponent;
  let fixture: ComponentFixture<ImageUploadComponent>;
  let mockImageUploadService: {
    getValidationError: jest.Mock;
    uploadImage: jest.Mock;
    getMediumUrl: jest.Mock;
  };

  beforeEach(async () => {
    mockImageUploadService = {
      getValidationError: jest.fn().mockReturnValue(null),
      uploadImage: jest.fn().mockReturnValue(of()),
      getMediumUrl: jest.fn((id: number) => `http://api.com/images/${id}/medium`)
    };

    await TestBed.configureTestingModule({
      imports: [ImageUploadComponent],
      providers: [
        { provide: ImageUploadService, useValue: mockImageUploadService },
        { provide: EnvironmentService, useValue: { apiUrl: 'http://api.com', apiVersion: 'v1' } }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();

    fixture = TestBed.createComponent(ImageUploadComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Drag and Drop', () => {
    it('should set isDragging to true on dragover', () => {
      const event = new DragEvent('dragover');
      jest.spyOn(event, 'preventDefault');
      jest.spyOn(event, 'stopPropagation');
      
      component.onDragOver(event);
      
      expect(component.isDragging()).toBe(true);
      expect(event.preventDefault).toHaveBeenCalled();
      expect(event.stopPropagation).toHaveBeenCalled();
    });

    it('should set isDragging to false on dragleave', () => {
      component.isDragging.set(true);
      const event = new DragEvent('dragleave');
      jest.spyOn(event, 'preventDefault');
      jest.spyOn(event, 'stopPropagation');

      component.onDragLeave(event);

      expect(component.isDragging()).toBe(false);
      expect(event.preventDefault).toHaveBeenCalled();
      expect(event.stopPropagation).toHaveBeenCalled();
    });

    it('should set isDragging to false and handle file on drop', () => {
      component.isDragging.set(true);
      const file = new File(['test'], 'test.png', { type: 'image/png' });
      const dataTransfer = new DataTransfer();
      dataTransfer.items.add(file);
      
      const event = new DragEvent('drop', { dataTransfer });
      jest.spyOn(event, 'preventDefault');
      jest.spyOn(event, 'stopPropagation');
      const handleFileSpy = jest.spyOn(component as unknown as { handleFile: (file: File) => void }, 'handleFile');

      component.onDrop(event);

      expect(component.isDragging()).toBe(false);
      expect(event.preventDefault).toHaveBeenCalled();
      expect(handleFileSpy).toHaveBeenCalledWith(file);
    });
    
    it('should do nothing on drop if no files', () => {
       const event = new DragEvent('drop', { dataTransfer: new DataTransfer() });
       const handleFileSpy = jest.spyOn(component as unknown as { handleFile: (file: File) => void }, 'handleFile');
       
       component.onDrop(event);
       
       expect(handleFileSpy).not.toHaveBeenCalled();
    });
  });

  describe('File Selection', () => {
    it('should handle file selection via input', () => {
      const file = new File(['test'], 'test.png', { type: 'image/png' });
      const event = {
        target: { files: [file] }
      } as unknown as Event;
      
      const handleFileSpy = jest.spyOn(component as unknown as { handleFile: (file: File) => void }, 'handleFile');
      
      component.onFileSelected(event);
      
      expect(handleFileSpy).toHaveBeenCalledWith(file);
    });
  });

  describe('Upload Logic', () => {
    const mockFile = new File(['content'], 'test.jpg', { type: 'image/jpeg' });

    it('should handle validation error', () => {
      const errorMsg = 'Invalid format';
      mockImageUploadService.getValidationError.mockReturnValue(errorMsg);
      const uploadErrorSpy = jest.spyOn(component.uploadError, 'emit');

      (component as unknown as { handleFile: (file: File) => void }).handleFile(mockFile);

      const state = component.uploadState();
      expect(state).toBeTruthy();
      expect(state?.error).toBe(errorMsg);
      expect(state?.uploading).toBe(false);
      expect(uploadErrorSpy).toHaveBeenCalledWith(errorMsg);
    });

    it('should start upload if validation passes', () => {
      mockImageUploadService.getValidationError.mockReturnValue(null);
      mockImageUploadService.uploadImage.mockReturnValue(new Subject());

      (component as unknown as { handleFile: (file: File) => void }).handleFile(mockFile);

      const state = component.uploadState();
      expect(state?.uploading).toBe(true);
      expect(state?.progress).toBe(0);
      expect(state?.error).toBeNull();
      
      expect(mockImageUploadService.uploadImage).toHaveBeenCalledWith({
        file: mockFile,
        folderId: undefined
      });
    });

    it('should update progress', () => {
      mockImageUploadService.getValidationError.mockReturnValue(null);
      const progressSubject = new Subject<HttpProgressEvent>();
      mockImageUploadService.uploadImage.mockReturnValue(progressSubject.asObservable());

      (component as unknown as { handleFile: (file: File) => void }).handleFile(mockFile);
      
      progressSubject.next({
        type: HttpEventType.UploadProgress,
        loaded: 50,
        total: 100
      } as HttpProgressEvent);

      expect(component.uploadState()?.progress).toBe(50);
    });

    it('should handle upload success', () => {
      mockImageUploadService.getValidationError.mockReturnValue(null);
      const uploadSubject = new Subject<HttpEvent<UploadImageResponse>>();
      mockImageUploadService.uploadImage.mockReturnValue(uploadSubject.asObservable());
      const completeSpy = jest.spyOn(component.uploadComplete, 'emit');

      (component as unknown as { handleFile: (file: File) => void }).handleFile(mockFile);
      
      const mockResponse: UploadImageResponse = { 
        id: 123, 
        fileName: 'test.jpg',
        originalName: 'test.jpg', 
        contentType: 'image/jpeg',
        width: 100, 
        height: 100, 
        size: 1024, 
        hasThumbnail: true,
        hasMediumVersion: true,
        createdAt: new Date().toISOString()
      };
      
      uploadSubject.next(new HttpResponse<UploadImageResponse>({
        body: mockResponse,
        status: 200,
        statusText: 'OK',
        url: '',
        headers: new HttpHeaders()
      }));

      const state = component.uploadState();
      expect(state?.uploading).toBe(false);
      expect(state?.result).toEqual(mockResponse);
      expect(completeSpy).toHaveBeenCalledWith(mockResponse);
    });

    it('should handle upload error', () => {
      mockImageUploadService.getValidationError.mockReturnValue(null);
      const uploadSubject = new Subject();
      mockImageUploadService.uploadImage.mockReturnValue(uploadSubject.asObservable());
      const errorSpy = jest.spyOn(component.uploadError, 'emit');

      (component as unknown as { handleFile: (file: File) => void }).handleFile(mockFile);
      
      const errorResponse = new HttpErrorResponse({ error: { message: 'Server Error' } });
      uploadSubject.error(errorResponse);

      const state = component.uploadState();
      expect(state?.uploading).toBe(false);
      expect(state?.error).toBe('Server Error');
      expect(errorSpy).toHaveBeenCalledWith('Server Error');
    });
    
    it('should use default error message if none provided', () => {
      mockImageUploadService.getValidationError.mockReturnValue(null);
      const uploadSubject = new Subject();
      mockImageUploadService.uploadImage.mockReturnValue(uploadSubject.asObservable());

      (component as unknown as { handleFile: (file: File) => void }).handleFile(mockFile);
      
      const errorResponse = new HttpErrorResponse({ error: {} });
      uploadSubject.error(errorResponse);

      expect(component.uploadState()?.error).toBe('Upload failed. Please try again.');
    });
  });

  describe('UI Helpers', () => {
    it('should format file size', () => {
      expect(component.formatFileSize(500)).toBe('500 B');
      expect(component.formatFileSize(1024)).toBe('1.0 KB');
      expect(component.formatFileSize(1024 * 1024)).toBe('1.0 MB');
      expect(component.formatFileSize(1.5 * 1024 * 1024)).toBe('1.5 MB');
    });

    it('should get image url', () => {
      expect(component.getImageUrl(123)).toBe('http://api.com/images/123/medium');
    });
  });
  
  describe('Reset', () => {
    it('should reset upload state', () => {
      component.uploadState.set({
        file: new File([], 'test'),
        progress: 100,
        uploading: false,
        result: {} as UploadImageResponse,
        error: null
      });
      
      component.reset();
      
      expect(component.uploadState()).toBeNull();
    });
  });
});
