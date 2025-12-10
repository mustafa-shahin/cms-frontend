import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { HttpParams, provideHttpClient } from '@angular/common/http';
import { ApiService, RequestOptions } from './api.service';
import { EnvironmentService } from './environment.service';

describe('ApiService', () => {
  let service: ApiService;
  let httpMock: HttpTestingController;
  let environmentService: EnvironmentService;

  const mockApiUrl = 'https://api.test.com';
  const mockApiVersion = 'v1';

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        ApiService,
        {
          provide: EnvironmentService,
          useValue: {
            getApiUrl: (endpoint: string) => `${mockApiUrl}/${mockApiVersion}/${endpoint}`
          }
        }
      ]
    });

    service = TestBed.inject(ApiService);
    httpMock = TestBed.inject(HttpTestingController);
    environmentService = TestBed.inject(EnvironmentService);
  });

  afterEach(() => {
    httpMock.verify();
  });

  describe('get', () => {
    it('should make GET request and unwrap data', () => {
      const mockData = { id: 1, name: 'Test' };
      
      service.get<typeof mockData>('users/1').subscribe(data => {
        expect(data).toEqual(mockData);
      });

      const req = httpMock.expectOne(`${mockApiUrl}/${mockApiVersion}/users/1`);
      expect(req.request.method).toBe('GET');
      req.flush({ data: mockData });
    });

    it('should pass headers in request', () => {
      const options: RequestOptions = {
        headers: { 'Authorization': 'Bearer token123' }
      };

      service.get('users', options).subscribe();

      const req = httpMock.expectOne(`${mockApiUrl}/${mockApiVersion}/users`);
      expect(req.request.headers.get('Authorization')).toBe('Bearer token123');
      req.flush({ data: {} });
    });

    it('should pass params in request', () => {
      const options: RequestOptions = {
        params: new HttpParams().set('page', '1').set('size', '10')
      };

      service.get('users', options).subscribe();

      const req = httpMock.expectOne(r => r.url === `${mockApiUrl}/${mockApiVersion}/users`);
      expect(req.request.params.get('page')).toBe('1');
      expect(req.request.params.get('size')).toBe('10');
      req.flush({ data: {} });
    });

    it('should handle null data in response', () => {
      service.get('users/1').subscribe(data => {
        expect(data).toBeNull();
      });

      const req = httpMock.expectOne(`${mockApiUrl}/${mockApiVersion}/users/1`);
      req.flush({ data: null });
    });
  });

  describe('getPaginated', () => {
    it('should make GET request and return full paginated response', () => {
      const mockResponse = {
        items: [{ id: 1 }, { id: 2 }],
        totalCount: 100,
        pageNumber: 1,
        pageSize: 10,
        hasNextPage: true,
        hasPreviousPage: false
      };

      service.getPaginated('users').subscribe(data => {
        expect(data).toEqual(mockResponse);
      });

      const req = httpMock.expectOne(`${mockApiUrl}/${mockApiVersion}/users`);
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });
  });

  describe('post', () => {
    it('should make POST request with body', () => {
      const body = { name: 'New User', email: 'test@test.com' };
      const mockResponse = { id: 1, ...body };

      service.post('users', body).subscribe(data => {
        expect(data).toEqual(mockResponse);
      });

      const req = httpMock.expectOne(`${mockApiUrl}/${mockApiVersion}/users`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(body);
      req.flush({ data: mockResponse });
    });

    it('should handle null response (204 No Content)', () => {
      service.post('users/1/activate', {}).subscribe(data => {
        expect(data).toBeUndefined();
      });

      const req = httpMock.expectOne(`${mockApiUrl}/${mockApiVersion}/users/1/activate`);
      req.flush(null);
    });

    it('should pass headers and params', () => {
      const options: RequestOptions = {
        headers: { 'Content-Type': 'application/json' },
        params: { 'notify': 'true' }
      };

      service.post('users', {}, options).subscribe();

      const req = httpMock.expectOne(r => r.url === `${mockApiUrl}/${mockApiVersion}/users`);
      expect(req.request.headers.get('Content-Type')).toBe('application/json');
      req.flush({ data: {} });
    });
  });

  describe('put', () => {
    it('should make PUT request with body', () => {
      const body = { id: 1, name: 'Updated User' };
      const mockResponse = body;

      service.put('users/1', body).subscribe(data => {
        expect(data).toEqual(mockResponse);
      });

      const req = httpMock.expectOne(`${mockApiUrl}/${mockApiVersion}/users/1`);
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual(body);
      req.flush({ data: mockResponse });
    });
  });

  describe('patch', () => {
    it('should make PATCH request with body', () => {
      const body = { name: 'Patched Name' };
      const mockResponse = { id: 1, ...body };

      service.patch('users/1', body).subscribe(data => {
        expect(data).toEqual(mockResponse);
      });

      const req = httpMock.expectOne(`${mockApiUrl}/${mockApiVersion}/users/1`);
      expect(req.request.method).toBe('PATCH');
      expect(req.request.body).toEqual(body);
      req.flush({ data: mockResponse });
    });
  });

  describe('delete', () => {
    it('should make DELETE request', () => {
      service.delete('users/1').subscribe(data => {
        expect(data).toBeNull();
      });

      const req = httpMock.expectOne(`${mockApiUrl}/${mockApiVersion}/users/1`);
      expect(req.request.method).toBe('DELETE');
      req.flush({ data: null });
    });

    it('should pass options to delete request', () => {
      const options: RequestOptions = {
        headers: { 'X-Confirm': 'true' }
      };

      service.delete('users/1', options).subscribe();

      const req = httpMock.expectOne(`${mockApiUrl}/${mockApiVersion}/users/1`);
      expect(req.request.headers.get('X-Confirm')).toBe('true');
      req.flush({ data: null });
    });
  });

  describe('error handling', () => {
    it('should handle 401 Unauthorized error', () => {
      service.get('protected').subscribe({
        error: (error) => {
          expect(error.status).toBe(401);
          expect(error.message).toBe('Unauthorized. Please login again.');
        }
      });

      const req = httpMock.expectOne(`${mockApiUrl}/${mockApiVersion}/protected`);
      req.flush({ message: 'Unauthorized' }, { status: 401, statusText: 'Unauthorized' });
    });

    it('should handle 403 Forbidden error', () => {
      service.get('admin').subscribe({
        error: (error) => {
          expect(error.status).toBe(403);
          expect(error.message).toBe('Forbidden. You do not have permission to access this resource.');
        }
      });

      const req = httpMock.expectOne(`${mockApiUrl}/${mockApiVersion}/admin`);
      req.flush({}, { status: 403, statusText: 'Forbidden' });
    });

    it('should handle 404 Not Found error', () => {
      service.get('users/999').subscribe({
        error: (error) => {
          expect(error.status).toBe(404);
          expect(error.message).toBe('Resource not found.');
        }
      });

      const req = httpMock.expectOne(`${mockApiUrl}/${mockApiVersion}/users/999`);
      req.flush({}, { status: 404, statusText: 'Not Found' });
    });

    it('should handle 500 Server error', () => {
      service.get('crash').subscribe({
        error: (error) => {
          expect(error.status).toBe(500);
          expect(error.message).toBe('Server error. Please try again later.');
        }
      });

      const req = httpMock.expectOne(`${mockApiUrl}/${mockApiVersion}/crash`);
      req.flush({}, { status: 500, statusText: 'Internal Server Error' });
    });

    it('should handle 502 Bad Gateway error', () => {
      service.get('crash').subscribe({
        error: (error) => {
          expect(error.status).toBe(502);
          expect(error.message).toBe('Server error. Please try again later.');
        }
      });

      const req = httpMock.expectOne(`${mockApiUrl}/${mockApiVersion}/crash`);
      req.flush({}, { status: 502, statusText: 'Bad Gateway' });
    });

    it('should handle network error (status 0)', () => {
      service.get('offline').subscribe({
        error: (error) => {
          expect(error.status).toBe(0);
          expect(error.message).toBe('Unable to connect to the server. Please check your internet connection.');
        }
      });

      const req = httpMock.expectOne(`${mockApiUrl}/${mockApiVersion}/offline`);
      req.error(new ProgressEvent('error'), { status: 0, statusText: 'Unknown Error' });
    });

    it('should use server error message when provided', () => {
      const serverMessage = 'Custom validation error message';
      
      service.post('users', {}).subscribe({
        error: (error) => {
          expect(error.message).toBe(serverMessage);
        }
      });

      const req = httpMock.expectOne(`${mockApiUrl}/${mockApiVersion}/users`);
      req.flush({ message: serverMessage }, { status: 400, statusText: 'Bad Request' });
    });

    it('should include original error in response', () => {
      const serverError = { message: 'Error', details: ['Field X is required'] };
      
      service.post('users', {}).subscribe({
        error: (error) => {
          expect(error.error).toEqual(serverError);
        }
      });

      const req = httpMock.expectOne(`${mockApiUrl}/${mockApiVersion}/users`);
      req.flush(serverError, { status: 400, statusText: 'Bad Request' });
    });

    it('should handle client-side error (ErrorEvent)', () => {
      service.get('test').subscribe({
        error: (error) => {
          expect(error.message).toContain('Network error');
        }
      });

      const req = httpMock.expectOne(`${mockApiUrl}/${mockApiVersion}/test`);
      const errorEvent = new ErrorEvent('error', { message: 'Network error' });
      req.error(errorEvent);
    });
  });
});
