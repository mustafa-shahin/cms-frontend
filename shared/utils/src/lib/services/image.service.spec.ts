import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { ImageService } from './image.service';
import { ApiService } from './api.service';
import { EnvironmentService } from './environment.service';
import { ImageListDto, UpdateImageDto } from '@cms/shared/api-interfaces';

describe('ImageService', () => {
  let service: ImageService;
  let apiServiceSpy: jest.Mocked<ApiService>;

  const mockImage: ImageListDto = {
    id: 1,
    fileName: 'test-image.jpg',
    originalName: 'test-image.jpg',
    contentType: 'image/jpeg',
    size: 1024,
    width: 800,
    height: 600,
    altText: 'Test image',
    caption: 'A test image',
    hasThumbnail: true,
    hasMediumVersion: true,
    createdAt: new Date('2024-01-01T00:00:00Z'),
    lastModifiedAt: new Date('2024-01-01T00:00:00Z')
  };

  beforeEach(() => {
    const apiSpy = {
      get: jest.fn(),
      post: jest.fn(),
      put: jest.fn(),
      delete: jest.fn(),
      getBlob: jest.fn()
    };

    const envSpy = {
      apiUrl: 'https://api.example.com',
      apiVersion: 'v1'
    };

    TestBed.configureTestingModule({
      providers: [
        ImageService,
        { provide: ApiService, useValue: apiSpy },
        { provide: EnvironmentService, useValue: envSpy }
      ]
    });

    service = TestBed.inject(ImageService);
    apiServiceSpy = TestBed.inject(ApiService) as jest.Mocked<ApiService>;
  });

  describe('initialization', () => {
    it('should be created', () => {
      expect(service).toBeTruthy();
    });
  });

  describe('getImages', () => {
    it('should call post with search endpoint and default parameters', (done) => {
      const searchResponse = {
        items: [mockImage],
        pageNumber: 1,
        pageSize: 12,
        totalCount: 1,
        totalPages: 1,
        hasPreviousPage: false,
        hasNextPage: false
      };
      apiServiceSpy.post.mockReturnValue(of(searchResponse));

      service.getImages().subscribe(result => {
        expect(apiServiceSpy.post).toHaveBeenCalledWith('images/search', {
          pageNumber: 1,
          pageSize: 12,
          sortDescending: false
        });
        expect(result.items).toEqual([mockImage]);
        done();
      });
    });

    it('should include searchTerm when provided', (done) => {
      const searchResponse = {
        items: [],
        pageNumber: 1,
        pageSize: 12,
        totalCount: 0,
        hasPreviousPage: false,
        hasNextPage: false
      };
      apiServiceSpy.post.mockReturnValue(of(searchResponse));

      service.getImages(1, 12, 'test search').subscribe(() => {
        expect(apiServiceSpy.post).toHaveBeenCalledWith('images/search', {
          pageNumber: 1,
          pageSize: 12,
          sortDescending: false,
          searchTerm: 'test search'
        });
        done();
      });
    });

    it('should include sortBy when provided', (done) => {
      const searchResponse = {
        items: [],
        pageNumber: 1,
        pageSize: 12,
        totalCount: 0,
        hasPreviousPage: false,
        hasNextPage: false
      };
      apiServiceSpy.post.mockReturnValue(of(searchResponse));

      service.getImages(1, 12, undefined, 'createdAt', true).subscribe(() => {
        expect(apiServiceSpy.post).toHaveBeenCalledWith('images/search', {
          pageNumber: 1,
          pageSize: 12,
          sortDescending: true,
          sortBy: 'createdAt'
        });
        done();
      });
    });

    it('should handle wrapped items with data property', (done) => {
      const searchResponse = {
        items: [{ data: mockImage }],
        pageNumber: 1,
        pageSize: 12,
        totalCount: 1,
        hasPreviousPage: false,
        hasNextPage: false
      };
      apiServiceSpy.post.mockReturnValue(of(searchResponse));

      service.getImages().subscribe(result => {
        expect(result.items).toEqual([mockImage]);
        done();
      });
    });

    it('should handle items without data wrapper', (done) => {
      const searchResponse = {
        items: [mockImage],
        pageNumber: 1,
        pageSize: 12,
        totalCount: 1,
        hasPreviousPage: false,
        hasNextPage: false
      };
      apiServiceSpy.post.mockReturnValue(of(searchResponse));

      service.getImages().subscribe(result => {
        expect(result.items).toEqual([mockImage]);
        done();
      });
    });

    it('should handle empty items array', (done) => {
      const searchResponse = {
        items: [],
        pageNumber: 1,
        pageSize: 12,
        totalCount: 0,
        hasPreviousPage: false,
        hasNextPage: false
      };
      apiServiceSpy.post.mockReturnValue(of(searchResponse));

      service.getImages().subscribe(result => {
        expect(result.items).toEqual([]);
        expect(result.totalCount).toBe(0);
        done();
      });
    });

    it('should handle undefined items', (done) => {
      const searchResponse = {
        pageNumber: 1,
        pageSize: 12,
        totalCount: 0,
        hasPreviousPage: false,
        hasNextPage: false
      };
      apiServiceSpy.post.mockReturnValue(of(searchResponse));

      service.getImages().subscribe(result => {
        expect(result.items).toEqual([]);
        done();
      });
    });

    it('should calculate totalPages when not provided', (done) => {
      const searchResponse = {
        items: [mockImage],
        pageNumber: 1,
        pageSize: 10,
        totalCount: 25,
        hasPreviousPage: false,
        hasNextPage: true
      };
      apiServiceSpy.post.mockReturnValue(of(searchResponse));

      service.getImages(1, 10).subscribe(result => {
        expect(result.totalPages).toBe(3);
        done();
      });
    });

    it('should use provided totalPages when available', (done) => {
      const searchResponse = {
        items: [mockImage],
        pageNumber: 1,
        pageSize: 10,
        totalCount: 25,
        totalPages: 5,
        hasPreviousPage: false,
        hasNextPage: true
      };
      apiServiceSpy.post.mockReturnValue(of(searchResponse));

      service.getImages(1, 10).subscribe(result => {
        expect(result.totalPages).toBe(5);
        done();
      });
    });

    it('should propagate API errors', (done) => {
      const error = new Error('API Error');
      apiServiceSpy.post.mockReturnValue(throwError(() => error));

      service.getImages().subscribe({
        error: (err) => {
          expect(err).toBe(error);
          done();
        }
      });
    });
  });

  describe('getImage', () => {
    it('should call get with correct endpoint', (done) => {
      apiServiceSpy.get.mockReturnValue(of(mockImage));

      service.getImage(1).subscribe(result => {
        expect(apiServiceSpy.get).toHaveBeenCalledWith('images/1');
        expect(result).toEqual(mockImage);
        done();
      });
    });

    it('should handle non-existent image', (done) => {
      const error = new Error('Not found');
      apiServiceSpy.get.mockReturnValue(throwError(() => error));

      service.getImage(999).subscribe({
        error: (err) => {
          expect(err).toBe(error);
          done();
        }
      });
    });
  });

  describe('uploadImage', () => {
    it('should upload file with FormData', (done) => {
      const file = new File(['test content'], 'test.jpg', { type: 'image/jpeg' });
      const uploadResponse = { ...mockImage };
      apiServiceSpy.post.mockReturnValue(of(uploadResponse));

      service.uploadImage(file).subscribe(uploadResult => {
        expect(apiServiceSpy.post).toHaveBeenCalled();
        const callArgs = apiServiceSpy.post.mock.calls[0];
        expect(callArgs[0]).toBe('images/upload');
        expect(callArgs[1]).toBeInstanceOf(FormData);
        expect(uploadResult).toBeDefined();
        done();
      });
    });

    it('should include altText when provided', (done) => {
      const file = new File(['test content'], 'test.jpg', { type: 'image/jpeg' });
      apiServiceSpy.post.mockReturnValue(of(mockImage));

      service.uploadImage(file, 'Alt text').subscribe(() => {
        const formData = apiServiceSpy.post.mock.calls[0][1] as FormData;
        expect(formData.get('altText')).toBe('Alt text');
        done();
      });
    });

    it('should include caption when provided', (done) => {
      const file = new File(['test content'], 'test.jpg', { type: 'image/jpeg' });
      apiServiceSpy.post.mockReturnValue(of(mockImage));

      service.uploadImage(file, undefined, 'Caption text').subscribe(() => {
        const formData = apiServiceSpy.post.mock.calls[0][1] as FormData;
        expect(formData.get('caption')).toBe('Caption text');
        done();
      });
    });

    it('should include folderId when provided', (done) => {
      const file = new File(['test content'], 'test.jpg', { type: 'image/jpeg' });
      apiServiceSpy.post.mockReturnValue(of(mockImage));

      service.uploadImage(file, undefined, undefined, 5).subscribe(() => {
        const formData = apiServiceSpy.post.mock.calls[0][1] as FormData;
        expect(formData.get('folderId')).toBe('5');
        done();
      });
    });

    it('should handle all optional parameters', (done) => {
      const file = new File(['test content'], 'test.jpg', { type: 'image/jpeg' });
      apiServiceSpy.post.mockReturnValue(of(mockImage));

      service.uploadImage(file, 'Alt', 'Caption', 10).subscribe(() => {
        const formData = apiServiceSpy.post.mock.calls[0][1] as FormData;
        expect(formData.get('file')).toBeTruthy();
        expect(formData.get('altText')).toBe('Alt');
        expect(formData.get('caption')).toBe('Caption');
        expect(formData.get('folderId')).toBe('10');
        done();
      });
    });
  });

  describe('updateImage', () => {
    it('should call put with correct endpoint and data', (done) => {
      const updateDto: UpdateImageDto = { id: 1, altText: 'Updated alt text' };
      apiServiceSpy.put.mockReturnValue(of({ ...mockImage, altText: 'Updated alt text' }));

      service.updateImage(1, updateDto).subscribe(result => {
        expect(apiServiceSpy.put).toHaveBeenCalledWith('images/1', updateDto);
        expect(result.altText).toBe('Updated alt text');
        done();
      });
    });

    it('should handle minimal update with only id', (done) => {
      const updateDto: UpdateImageDto = { id: 1 };
      apiServiceSpy.put.mockReturnValue(of(mockImage));

      service.updateImage(1, updateDto).subscribe(() => {
        expect(apiServiceSpy.put).toHaveBeenCalledWith('images/1', { id: 1 });
        done();
      });
    });
  });

  describe('deleteImage', () => {
    it('should call delete with correct endpoint', (done) => {
      apiServiceSpy.delete.mockReturnValue(of(undefined));

      service.deleteImage(1).subscribe(() => {
        expect(apiServiceSpy.delete).toHaveBeenCalledWith('images/1');
        done();
      });
    });

    it('should handle delete error', (done) => {
      const error = new Error('Delete failed');
      apiServiceSpy.delete.mockReturnValue(throwError(() => error));

      service.deleteImage(1).subscribe({
        error: (err) => {
          expect(err).toBe(error);
          done();
        }
      });
    });
  });

  describe('downloadImage', () => {
    it('should call getBlob with correct endpoint', (done) => {
      const blob = new Blob(['test'], { type: 'image/jpeg' });
      apiServiceSpy.getBlob.mockReturnValue(of(blob));

      service.downloadImage(1).subscribe(result => {
        expect(apiServiceSpy.getBlob).toHaveBeenCalledWith('images/1');
        expect(result).toBe(blob);
        done();
      });
    });
  });

  describe('getImageBlob', () => {
    const blob = new Blob(['test'], { type: 'image/jpeg' });

    it('should get original image by default', (done) => {
      apiServiceSpy.getBlob.mockReturnValue(of(blob));

      service.getImageBlob(1).subscribe(() => {
        expect(apiServiceSpy.getBlob).toHaveBeenCalledWith('images/1');
        done();
      });
    });

    it('should get original image explicitly', (done) => {
      apiServiceSpy.getBlob.mockReturnValue(of(blob));

      service.getImageBlob(1, 'original').subscribe(() => {
        expect(apiServiceSpy.getBlob).toHaveBeenCalledWith('images/1');
        done();
      });
    });

    it('should get thumbnail variant', (done) => {
      apiServiceSpy.getBlob.mockReturnValue(of(blob));

      service.getImageBlob(1, 'thumbnail').subscribe(() => {
        expect(apiServiceSpy.getBlob).toHaveBeenCalledWith('images/1/thumbnail');
        done();
      });
    });

    it('should get medium variant', (done) => {
      apiServiceSpy.getBlob.mockReturnValue(of(blob));

      service.getImageBlob(1, 'medium').subscribe(() => {
        expect(apiServiceSpy.getBlob).toHaveBeenCalledWith('images/1/medium');
        done();
      });
    });
  });

  describe('getImageUrl', () => {
    it('should return original URL by default', () => {
      const url = service.getImageUrl(1);
      expect(url).toBe('https://api.example.com/v1/images/1');
    });

    it('should return original URL explicitly', () => {
      const url = service.getImageUrl(1, 'original');
      expect(url).toBe('https://api.example.com/v1/images/1');
    });

    it('should return thumbnail URL', () => {
      const url = service.getImageUrl(1, 'thumbnail');
      expect(url).toBe('https://api.example.com/v1/images/1/thumbnail');
    });

    it('should return medium URL', () => {
      const url = service.getImageUrl(1, 'medium');
      expect(url).toBe('https://api.example.com/v1/images/1/medium');
    });
  });

  describe('getDownloadUrl', () => {
    it('should return correct download URL', () => {
      const url = service.getDownloadUrl(1);
      expect(url).toBe('https://api.example.com/v1/images/1');
    });

    it('should handle different image IDs', () => {
      const url = service.getDownloadUrl(12345);
      expect(url).toBe('https://api.example.com/v1/images/12345');
    });
  });

  describe('formatFileSize', () => {
    it('should format 0 bytes', () => {
      expect(service.formatFileSize(0)).toBe('0 Bytes');
    });

    it('should format bytes', () => {
      expect(service.formatFileSize(500)).toBe('500 Bytes');
    });

    it('should format kilobytes', () => {
      expect(service.formatFileSize(1024)).toBe('1 KB');
      expect(service.formatFileSize(1536)).toBe('1.5 KB');
    });

    it('should format megabytes', () => {
      expect(service.formatFileSize(1048576)).toBe('1 MB');
      expect(service.formatFileSize(5242880)).toBe('5 MB');
    });

    it('should format gigabytes', () => {
      expect(service.formatFileSize(1073741824)).toBe('1 GB');
    });

    it('should handle decimal precision', () => {
      expect(service.formatFileSize(1234567)).toBe('1.18 MB');
    });

    it('should handle edge case near boundary', () => {
      expect(service.formatFileSize(1023)).toBe('1023 Bytes');
      expect(service.formatFileSize(1025)).toBe('1 KB');
    });
  });

  describe('edge cases', () => {
    it('should handle image ID 0', () => {
      const url = service.getImageUrl(0);
      expect(url).toBe('https://api.example.com/v1/images/0');
    });

    it('should handle large image IDs', () => {
      const url = service.getImageUrl(Number.MAX_SAFE_INTEGER);
      expect(url).toBe(`https://api.example.com/v1/images/${Number.MAX_SAFE_INTEGER}`);
    });

    it('should handle negative file size', () => {
      // Negative size is technically invalid but should not crash
      const result = service.formatFileSize(-100);
      expect(result).toBeDefined();
    });

    it('should handle very large file sizes', () => {
      const result = service.formatFileSize(10737418240);
      expect(result).toBe('10 GB');
    });
  });
});
