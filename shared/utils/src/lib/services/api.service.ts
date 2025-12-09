import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { EnvironmentService } from './environment.service';
import { ApiResponse, PaginatedResponse } from '@cms/shared/api-interfaces';

export interface RequestOptions {
  headers?: HttpHeaders | { [header: string]: string | string[] };
  params?: HttpParams | { [param: string]: string | string[] };
}

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  private readonly http = inject(HttpClient);
  private readonly envService = inject(EnvironmentService);

  /**
   * GET request
   */
  get<T>(endpoint: string, options?: RequestOptions): Observable<T> {
    const url = this.envService.getApiUrl(endpoint);
    return this.http
      .get<ApiResponse<T>>(url, {
        headers: options?.headers,
        params: options?.params,
      })
      .pipe(
        map((response) => response.data as T),
        catchError(this.handleError)
      );
  }

  /**
   * GET request for paginated data
   */
  getPaginated<T>(
    endpoint: string,
    options?: RequestOptions
  ): Observable<PaginatedResponse<T>> {
    const url = this.envService.getApiUrl(endpoint);
    return this.http
      .get<PaginatedResponse<T>>(url, {
        headers: options?.headers,
        params: options?.params,
      })
      .pipe(catchError(this.handleError));
  }

  /**
   * POST request
   */
  post<T>(
    endpoint: string,
    body: unknown,
    options?: RequestOptions
  ): Observable<T> {
    const url = this.envService.getApiUrl(endpoint);
    return this.http
      .post<ApiResponse<T>>(url, body, {
        headers: options?.headers,
        params: options?.params,
      })
      .pipe(
        map((response) => response?.data as T),
        catchError(this.handleError)
      );
  }

  /**
   * PUT request
   */
  put<T>(
    endpoint: string,
    body: unknown,
    options?: RequestOptions
  ): Observable<T> {
    const url = this.envService.getApiUrl(endpoint);
    return this.http
      .put<ApiResponse<T>>(url, body, {
        headers: options?.headers,
        params: options?.params,
      })
      .pipe(
        map((response) => response.data as T),
        catchError(this.handleError)
      );
  }

  /**
   * PATCH request
   */
  patch<T>(
    endpoint: string,
    body: unknown,
    options?: RequestOptions
  ): Observable<T> {
    const url = this.envService.getApiUrl(endpoint);
    return this.http
      .patch<ApiResponse<T>>(url, body, {
        headers: options?.headers,
        params: options?.params,
      })
      .pipe(
        map((response) => response.data as T),
        catchError(this.handleError)
      );
  }

  /**
   * DELETE request
   */
  delete<T>(endpoint: string, options?: RequestOptions): Observable<T> {
    const url = this.envService.getApiUrl(endpoint);
    return this.http
      .delete<ApiResponse<T>>(url, {
        headers: options?.headers,
        params: options?.params,
      })
      .pipe(
        map((response) => response.data as T),
        catchError(this.handleError)
      );
  }

  /**
   * Handle HTTP errors
   */
  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'An unknown error occurred';

    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // Server-side error
      if (error.error?.message) {
        errorMessage = error.error.message;
      } else if (error.status === 0) {
        errorMessage = 'Unable to connect to the server. Please check your internet connection.';
      } else if (error.status === 401) {
        errorMessage = 'Unauthorized. Please login again.';
      } else if (error.status === 403) {
        errorMessage = 'Forbidden. You do not have permission to access this resource.';
      } else if (error.status === 404) {
        errorMessage = 'Resource not found.';
      } else if (error.status >= 500) {
        errorMessage = 'Server error. Please try again later.';
      }
    }

    return throwError(() => ({
      status: error.status,
      message: errorMessage,
      error: error.error,
    }));
  }
}