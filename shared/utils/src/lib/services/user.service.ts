import { Injectable, inject } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { UserDto, UserListDto, CreateUserDto, UpdateUserDto, UserRole, PaginatedResponse } from '@cms/shared/api-interfaces';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private readonly apiService = inject(ApiService);
  private readonly endpoint = 'users';

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

    return this.apiService.getPaginated<UserListDto>(this.endpoint, { params });
  }

  getUser(id: number): Observable<UserDto> {
    return this.apiService.get<UserDto>(`${this.endpoint}/${id}`);
  }

  createUser(user: CreateUserDto): Observable<UserDto> {
    return this.apiService.post<UserDto>(this.endpoint, user);
  }

  updateUser(id: number, user: UpdateUserDto): Observable<UserDto> {
    return this.apiService.put<UserDto>(`${this.endpoint}/${id}`, user);
  }

  deleteUser(id: number): Observable<void> {
    return this.apiService.delete<void>(`${this.endpoint}/${id}`);
  }

  activateUser(id: number): Observable<void> {
    return this.apiService.post<void>(`${this.endpoint}/${id}/activate`, {});
  }

  deactivateUser(id: number): Observable<void> {
    return this.apiService.post<void>(`${this.endpoint}/${id}/deactivate`, {});
  }
}
