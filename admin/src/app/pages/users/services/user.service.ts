import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiService } from '@cms/shared/utils';
import { UserDto, UserListDto, CreateUserDto, UpdateUserDto, UserRole, PaginatedResponse } from '@cms/shared/api-interfaces';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private readonly http = inject(HttpClient);
  private readonly apiService = inject(ApiService);
  private readonly baseUrl = '/api/v1/users';

  getUsers(
    pageNumber = 1,
    pageSize = 10,
    searchTerm?: string,
    roleFilter?: UserRole,
    isActiveFilter?: boolean,
    sortBy?: string,
    sortDescending = false
  ): Observable<PaginatedResponse<UserListDto>> {
    let params = new HttpParams()
      .set('pageNumber', pageNumber)
      .set('pageSize', pageSize)
      .set('sortDescending', sortDescending);

    if (searchTerm) params = params.set('searchTerm', searchTerm);
    if (roleFilter !== undefined && roleFilter !== null) params = params.set('roleFilter', roleFilter);
    if (isActiveFilter !== undefined && isActiveFilter !== null) params = params.set('isActiveFilter', isActiveFilter);
    if (sortBy) params = params.set('sortBy', sortBy);

    return this.http.get<PaginatedResponse<UserListDto>>(this.baseUrl, { params });
  }

  getUser(id: number): Observable<UserDto> {
    return this.http.get<UserDto>(`${this.baseUrl}/${id}`);
  }

  createUser(user: CreateUserDto): Observable<UserDto> {
    return this.http.post<UserDto>(this.baseUrl, user);
  }

  updateUser(id: number, user: UpdateUserDto): Observable<UserDto> {
    return this.http.put<UserDto>(`${this.baseUrl}/${id}`, user);
  }

  deleteUser(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  activateUser(id: number): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/${id}/activate`, {});
  }

  deactivateUser(id: number): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/${id}/deactivate`, {});
  }
}
